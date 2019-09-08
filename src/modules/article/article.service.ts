import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from './article.entity';
import { Repository, DeleteResult, SelectQueryBuilder } from 'typeorm';
import { TagService } from '../tag/tag.service';
import { UserEntity } from '../user/user.entity';
import { CreateArticleDto, UpdateArticleDto } from './dto';
import {
  ArticleRO,
  ArticleGeneralQuery,
  ArticleListRO,
  ArticleEmptyListFactory,
} from './article.interface';
import { ProfileService } from '../profile/profile.service';
import { EditPermissionException } from 'src/exceptions/edit-permission.exception';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { TagEntity } from '../tag/tag.entity';
import { ParsedUrlQuery } from 'querystring';
import { PaginationQuery } from '../common/interface/query';

export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly tagService: TagService,
    private readonly profileService: ProfileService,
  ) {}

  async findAll(
    query: ArticleGeneralQuery,
    user?: UserEntity,
  ): Promise<ArticleListRO> {
    let tag: TagEntity;
    let author: UserEntity;
    let favoritedByUser: UserEntity;

    const qb = this.articleRepository.createQueryBuilder('article');
    qb.leftJoinAndSelect('article.tagList', 'tag');

    qb.where('1 = 1');

    try {
      if ('tag' in query) {
        tag = await this.tagService.findTagByName(query.tag);
        const articleIdsWithTag = await this.articleRepository.query(
          `SELECT articleId FROM article_tag WHERE tagId = ?`,
          [tag.id],
        );
        qb.andWhere('article.id IN (:articleIdsWithTag)', {
          articleIdsWithTag: articleIdsWithTag.map(a => a.articleId),
        });
      }

      if ('author' in query) {
        author = await this.userRepository.findOneOrFail({
          username: query.author,
        });
        qb.andWhere('article.authorId = :authorId', { authorId: author.id });
      }

      if ('favorited' in query) {
        favoritedByUser =
          query.favorited === query.author
            ? author
            : await this.userRepository.findOneOrFail({
                username: query.favorited,
              });
        const idsFavorited = await this.userRepository.query(
          `
              SELECT articleId FROM favorites WHERE userId = ?
        `,
          [favoritedByUser.id],
        );
        qb.andWhere('article.id IN (:idsFavorited)', {
          idsFavorited: idsFavorited.map(i => i.articleId),
        });
      }

      return this.runQueryAndGetArticleList(qb, query, user);
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        return ArticleEmptyListFactory();
      } else {
        throw e;
      }
    }
  }

  async feed(query: PaginationQuery, user: UserEntity): Promise<ArticleListRO> {
    const followings = (await this.userRepository.findOneOrFail({
      relations: ['followings'],
      where: { id: user.id },
    })).followings;

    const followingsIds = followings.map(f => f.id);

    if (followingsIds.length === 0) {
      return ArticleEmptyListFactory();
    }

    const qb = this.articleRepository.createQueryBuilder('article');

    qb.where('article.authorId IN (:followingsIds)', { followingsIds });

    return this.runQueryAndGetArticleList(qb, query, user);
  }
  async findBySlug(slug: string, user?: UserEntity): Promise<ArticleRO> {
    const article = await this.articleRepository.findOne({ slug });

    return this.getRO(article, user);
  }

  async create(
    user: UserEntity,
    { title, body, description, tagList }: CreateArticleDto,
  ): Promise<ArticleRO> {
    const article = new ArticleEntity();
    article.title = title;
    article.body = body;
    article.description = description;
    article.author = user;

    if (Array.isArray(tagList)) {
      const tags = await this.tagService.saveTags(tagList);
      article.tagList = tags;
    }

    await this.articleRepository.save(article);

    return this.getRO(article, user, false);
  }

  async update(
    user: UserEntity,
    slug: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleRO> {
    const article = await this.articleRepository.findOneOrFail({ slug });

    if (user.id !== article.authorId) {
      throw new EditPermissionException();
    }

    delete article.title;
    Object.assign(article, updateArticleDto);
    article.updatedAt = new Date();
    const newArticle = await this.articleRepository.save(article);

    return this.getRO(newArticle, user);
  }

  async delete(user: UserEntity, slug: string): Promise<DeleteResult> {
    const article = await this.articleRepository.findOneOrFail({ slug });

    if (user.id !== article.authorId) {
      throw new EditPermissionException();
    }

    return this.articleRepository.delete({ slug });
  }

  async checkUserLikeArticle(
    userId: number,
    articleId: number,
  ): Promise<boolean> {
    const rel = await this.articleRepository.query(
      `SELECT * FROM favorites WHERE userId = ? AND articleId = ?`,
      [userId, articleId],
    );

    if (Array.isArray(rel) && rel.length > 0) {
      return true;
    }

    return false;
  }

  async favorite(user: UserEntity, slug: string): Promise<ArticleRO> {
    const article = await this.articleRepository.findOneOrFail({ slug });
    const isFavorite = await this.checkUserLikeArticle(user.id, article.id);
    if (isFavorite) {
      return this.getRO(article, user, isFavorite);
    }

    await this.userRepository
      .createQueryBuilder()
      .relation('favorites')
      .of(user.id)
      .add(article.id);

    const updateResult = await this.articleRepository.increment(
      { id: article.id },
      'favoritesCount',
      1,
    );

    if (updateResult.raw.changedRows >= 1) {
      article.favoritesCount += 1;
    }
    return this.getRO(article, user);
  }

  async unfavorite(user: UserEntity, slug: string) {
    const article = await this.articleRepository.findOneOrFail({ slug });
    const isFavorite = await this.checkUserLikeArticle(user.id, article.id);
    if (!isFavorite) {
      return this.getRO(article, user, isFavorite);
    }

    await this.userRepository
      .createQueryBuilder()
      .relation('favorites')
      .of(user.id)
      .remove(article.id);

    const updateResult = await this.articleRepository.decrement(
      { id: article.id },
      'favoritesCount',
      1,
    );

    if (updateResult.raw.changedRows >= 1) {
      article.favoritesCount -= 1;
    }

    return this.getRO(article, user);
  }

  private async getRO(
    article: ArticleEntity,
    user?: UserEntity,
    favorited?: boolean,
  ): Promise<ArticleRO> {
    if (!article) {
      return { article: null };
    }

    favorited =
      typeof favorited === 'boolean'
        ? favorited
        : user instanceof UserEntity
        ? await this.checkUserLikeArticle(user.id, article.id)
        : false;

    const { profile } = await this.profileService.getProfile(
      article.authorId,
      user,
    );

    return article.buildRO(profile, favorited);
  }

  private async runQueryAndGetArticleList(
    qb: SelectQueryBuilder<ArticleEntity>,
    query: PaginationQuery,
    user: UserEntity,
  ): Promise<ArticleListRO> {
    qb.orderBy('article.createdAt', 'DESC');
    const articlesCount = await qb.getCount();

    qb.take(+query.limit || 10);

    qb.skip(+query.offset || 0);

    const articles = await qb.getMany();
    const parsedArticles = await Promise.all(
      articles.map(a => this.getRO(a, user)),
    );

    return {
      articles: parsedArticles,
      articlesCount,
    };
  }
}
