import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Exclude, Expose, plainToClass } from 'class-transformer';
import { IsNotEmpty, IsEmail } from 'class-validator';
import { hashPassword } from 'src/shared/utils';

// every property of UserEntityRO should have @Expose() decorate in UserEntity
export interface UserEntityRO {
  username: string;
  email: string;
  bio: string;
  image: string;
}

export type UserData = UserEntityRO & { token: string };
export interface UserRO {
  user: UserData;
}

@Entity('user')
@Exclude()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @Expose()
  username: string;

  @Column()
  @IsEmail()
  @Expose()
  email: string;

  @Column({ default: '' })
  @Expose()
  bio: string;

  @Column({ default: '' })
  @Expose()
  image: string;

  @Column()
  @IsNotEmpty()
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  hashPassword() {
    this.password = hashPassword(this.password);
  }

  @ManyToMany(type => UserEntity, user => user.followers, {
    cascade: true,
  })
  @JoinTable({
    name: 'follow_relation',
    joinColumn: {
      name: 'followerId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'followeeId',
      referencedColumnName: 'id',
    },
  })
  followings: UserEntity[];

  @ManyToMany(type => UserEntity, user => user.followings, {
    cascade: ['update', 'insert'],
  })
  followers: UserEntity[];

  private static buildEntityRO(user: UserEntity): UserEntityRO {
    return plainToClass(UserEntity, user, {
      excludeExtraneousValues: true,
    });
  }

  static buildRO(user: UserEntity, token: string): UserRO {
    const userData = {
      ...UserEntity.buildEntityRO(user),
      token,
    };

    const userRO = {
      user: userData,
    };

    return userRO;
  }
}