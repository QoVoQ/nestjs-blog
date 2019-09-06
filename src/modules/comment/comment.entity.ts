import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { ArticleEntity } from '../article/article.entity';
import { Profile } from '../profile/profile.interface';

@Entity('comment')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({
    type: 'text',
  })
  body: string;

  @Column()
  authorId: number;
  @ManyToOne(type => UserEntity, user => user.comments, { eager: true })
  @JoinColumn({
    name: 'authorId',
    referencedColumnName: 'id',
  })
  author: UserEntity;

  @Column()
  articleId: number;

  @ManyToOne(type => ArticleEntity, article => article.comments)
  @JoinColumn({
    name: 'articleId',
    referencedColumnName: 'id',
  })
  article: ArticleEntity;

  buildROData(profile: Profile) {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      body: this.body,
      // @TODO need to fix
      author: (profile as any).profile,
    };
  }

  buildRO(profile) {
    return { comment: this.buildROData(profile) };
  }
}
