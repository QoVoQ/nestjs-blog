import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from './comment.entity';
import { Repository, DeleteResult } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UserEntity } from '../user/user.entity';
import { CommentRO, CommentsRO } from './comment.interface';
import { ArticleEntity } from '../article/article.entity';
import { ProfileService } from '../profile/profile.service';
import { Profile, ProfileRO } from '../profile/profile.interface';
import { EditPermissionException } from 'src/exceptions/edit-permission.exception';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    private readonly profileService: ProfileService,
  ) {}

  async create(
    slug: string,
    dto: CreateCommentDto,
    user: UserEntity,
  ): Promise<CommentRO> {
    const article = await this.articleRepository.findOneOrFail({ slug });
    let comment = new CommentEntity();
    comment.body = dto.body;
    comment.article = article;
    comment.author = user;

    comment = await this.commentRepository.save(comment);

    const { profile } = user.buildProfile(false);

    return comment.buildRO(profile);
  }

  async findAll(slug: string, user?: UserEntity): Promise<CommentsRO> {
    const article = await this.articleRepository.findOneOrFail({ slug });
    const commentEntities: CommentEntity[] = await this.commentRepository
      .createQueryBuilder('comment')
      .orderBy('comment.createdAt', 'DESC')
      .where('comment.articleId = :articleId', { articleId: article.id })
      .getMany();

    // const comments: CommentEntity[] = await this.articleRepository.query(
    //   `SELECT * FROM comment WHERE articleId = ? ORDER BY created_at DESC`,[article.id]
    // );

    const profileROs = await Promise.all(
      commentEntities.map(c =>
        this.profileService.getProfile(c.authorId, user),
      ),
    );

    const comments = commentEntities.map((c, i) => {
      return c.buildROData(profileROs[i].profile);
    });

    return {
      comments,
    };
  }

  async delete(
    slug: string,
    id: number,
    user: UserEntity,
  ): Promise<DeleteResult> {
    const article = await this.articleRepository.findOneOrFail({ slug });
    const comment = await this.commentRepository.findOneOrFail(id);
    if (comment.authorId !== user.id) {
      throw new EditPermissionException();
    }
    if (comment.articleId !== article.id) {
      throw new HttpException(
        { errors: { comment: 'Article and comment not match' } },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return this.commentRepository.delete(id);
  }
}
