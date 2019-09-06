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
import slugify from '@sindresorhus/slugify';
import { UserEntity } from '../user/user.entity';
import { TagEntity } from '../tag/tag.entity';
import { Expose, Exclude, plainToClass, Type } from 'class-transformer';
import { ArticleRO } from './article.interface';
import { Profile } from '../profile/profile.interface';

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
      slugify(this.title, { lowercase: true }) +
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
    type: 'text',
  })
  @Expose()
  body: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  @Expose()
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Expose()
  updatedAt: Date;

  @Column({ default: 0 })
  @Expose()
  favoritesCount: number;

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
  @Type(() => TagEntity)
  tagList: TagEntity[];

  // @OneToMany()
  // comments: CommentEntity[]

  @Column()
  authorId: number;

  @ManyToOne(type => UserEntity, user => user.articles)
  author: UserEntity;

  buildRO(
    this: ArticleEntity,
    authorProfile: Profile,
    favorited: boolean,
  ): ArticleRO {
    const { tagList, ...articleContent } = plainToClass(ArticleEntity, this, {
      excludeExtraneousValues: true,
    });

    const tags = Array.isArray(tagList)
      ? tagList.map(tag => tag.buildRO())
      : [];

    return {
      article: {
        ...articleContent,
        favorited,
        tagList: tags,
        author: authorProfile,
      },
    };
  }

  update(data: Partial<ArticleEntity>) {
    // prevent re-slugify in @beforeUpdate
    if (data.title === undefined) {
      delete this.title;
    }

    Object.assign(this, data);
  }
}
