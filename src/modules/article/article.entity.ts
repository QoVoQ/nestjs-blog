import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import slug from 'slug';
import { UserEntity } from '../user';
import { TagEntity } from '../tag';
import { Expose, Exclude, plainToClass } from 'class-transformer';
import { ArticleRO } from './article.interface';

@Entity('article')
@Exclude()
export class ArticleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    default: '',
  })
  @Expose()
  slug: string;

  @BeforeInsert()
  @BeforeUpdate()
  makeSlug() {
    this.slug =
      slug(this.title, { lower: true }) +
      '-' +
      Math.floor(Math.random() * Math.pow(36, 6)).toString(36);
  }

  @Column({
    nullable: false,
    default: '',
  })
  @Expose()
  title: string;

  @Column({
    nullable: false,
    default: '',
  })
  @Expose()
  description: string;

  @Column({
    nullable: false,
    default: '',
  })
  @Expose()
  body: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  @Expose()
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  @Expose()
  updatedAt: Date;

  @Column({ default: 0 })
  @Expose()
  favoriteCount: number;

  @ManyToMany(type => TagEntity, { eager: true })
  @JoinTable({
    name: 'article_tag',
    joinColumn: {
      name: 'articleId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tagId',
      referencedColumnName: 'id',
    },
  })
  @Expose()
  tagList: TagEntity[];

  // @OneToMany()
  // comments: CommentEntity[]

  @ManyToOne(type => UserEntity, user => user.articles, { eager: true })
  @Expose()
  author: UserEntity;

  buildRO(this: ArticleEntity, favorited: boolean): ArticleRO {
    const { tagList, ...articleContent } = plainToClass(ArticleEntity, this, {
      excludeExtraneousValues: true,
    });

    const tags = tagList.map(tag => tag.buildRO());

    return { article: { ...articleContent, favorited, tagList: tags } };
  }
}
