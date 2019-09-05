import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from './article.entity';
import { Repository, DeleteResult } from 'typeorm';
import { TagService } from '../tag/tag.service';
import { UserEntity } from '../user/user.entity';
import { CreateArticleDto, UpdateArticleDto } from './dto';
import { ArticleRO } from './article.interface';
import { ProfileService } from '../profile/profile.service';

export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    private readonly tagService: TagService,
    private readonly profileService: ProfileService,
  ) {}

  async findBySlug(slug: string, user?: UserEntity): Promise<ArticleRO> {
    const article = await this.articleRepository.findOneOrFail({ slug });

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

    return this.getRO(article, user);
  }

  async update(
    user: UserEntity,
    slug: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleRO> {
    const article = await this.articleRepository.findOneOrFail({ slug });

    delete article.title;
    Object.assign(article, updateArticleDto);
    const newArticle = await this.articleRepository.save(article);

    return this.getRO(newArticle, user);
  }

  async delete(slug: string): Promise<DeleteResult> {
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

  private async getRO(
    article: ArticleEntity,
    user?: UserEntity,
  ): Promise<ArticleRO> {
    const favorited =
      user instanceof UserEntity
        ? await this.checkUserLikeArticle(user.id, article.id)
        : false;

    const { profile } = await this.profileService.getProfile(
      article.authorId,
      user,
    );

    return article.buildRO(profile, favorited);
  }
}
