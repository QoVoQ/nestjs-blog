import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from './article.entity';
import { Repository } from 'typeorm';
import { TagService } from '../tag';
import { UserEntity } from '../user/user.entity';
import { CreateArticleDto } from './dto';
import { ArticleRO } from './article.interface';

export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    private readonly tagService: TagService,
  ) {}

  async findBySlug(slug: string): Promise<ArticleRO> {
    const article = await this.articleRepository.findOneOrFail({ slug });
    return {} as ArticleRO;
  }

  async create(
    user: UserEntity,
    { title, body, description, tagList }: CreateArticleDto,
  ) {
    const article = new ArticleEntity();
    article.title = title;
    article.body = body;
    article.description = description;
    article.author = user;

    if (Array.isArray(tagList)) {
      await this.tagService.saveTags(tagList);
    }

    return this.articleRepository.save(article);
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
}
