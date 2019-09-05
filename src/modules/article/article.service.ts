import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from './article.entity';
import { Repository, DeleteResult } from 'typeorm';
import { TagService } from '../tag/tag.service';
import { UserEntity } from '../user/user.entity';
import { CreateArticleDto, UpdateArticleDto } from './dto';
import { ArticleRO } from './article.interface';

export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    private readonly tagService: TagService,
  ) {}

  async findBySlug(slug: string, userId?: number): Promise<ArticleRO> {
    const article = await this.articleRepository.findOneOrFail({ slug });

    return this.getRO(article, userId);
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
      await this.tagService.saveTags(tagList);
    }

    await this.articleRepository.save(article);

    return article.buildRO(false);
  }

  async update(
    userId: number,
    slug: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleRO> {
    const article = await this.articleRepository.findOneOrFail({ slug });

    delete article.title;
    Object.assign(article, updateArticleDto);
    const newArticle = await this.articleRepository.save(article);

    return this.getRO(newArticle, userId);
  }

  async delete(slug: string): Promise<DeleteResult> {
    return this.articleRepository.delete({ slug });
  }

  async checkUserLikeArticle(
    userId: number,
    articleId: number,
  ): Promise<boolean> {
    const rel = await this.articleRepository.query(
      `SELECT * FROM favourites WHERE userId = ? AND articleId = ?`,
      [userId, articleId],
    );

    if (Array.isArray(rel) && rel.length > 0) {
      return true;
    }

    return false;
  }

  private async getRO(
    article: ArticleEntity,
    userId?: number,
  ): Promise<ArticleRO> {
    const favorited =
      typeof userId === 'number'
        ? await this.checkUserLikeArticle(userId, article.id)
        : false;

    return article.buildRO(favorited);
  }
}
