import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { hashPassword } from 'src/shared/utils';
import { UserEntity } from './user.entity';
import { LoginUserDto, CreateUserDto, UpdateUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { UserNotFoundException } from 'src/exceptions/user-not-found.exception';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    private readonly jwtService: JwtService,
  ) {}
  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async findById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne(id);
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOne({ email });
  }

  // async getProfile(
  //   username: string,
  //   token: string | null | UserEntity,
  // ): Promise<ProfileRO> {
  //   const userBeingChecked = await this.userRepository.findOne({ username });
  //   if (userBeingChecked === undefined) {
  //     return {
  //       profile: null,
  //     };
  //   }

  //   let userIdChecking: number;
  //   if (typeof token === 'string') {
  //     // use exception filter here?
  //     // handle exception when token verification fail, throw other exceptions
  //     userIdChecking = ((await this.jwtService.verifyAsync(
  //       token,
  //     )) as JwtPayload).userId;
  //   } else if (token instanceof UserEntity) {
  //     userIdChecking = token.id;
  //   }

  //   const following =
  //     typeof userIdChecking === 'number'
  //       ? await this.checkIfAFollowingB(userIdChecking, userBeingChecked.id)
  //       : false;

  //   return userBeingChecked.buildProfile(following);
  // }

  // async follow(username: string, user: UserEntity): Promise<ProfileRO> {
  //   const userToFollow = await this.userRepository.findOne({ username });
  //   if (userToFollow === undefined) {
  //     throw new UserNotFoundException(`username: ${username}`);
  //   }

  //   const profile = await this.getProfile(username, user);

  //   if (profile.profile.following) {
  //     return profile;
  //   }

  //   await this.userRepository
  //     .createQueryBuilder('user')
  //     .relation('followings')
  //     .of(user.id)
  //     .add(userToFollow.id);

  //   profile.profile.following = true;
  //   // return profile;
  //   return await this.getProfile(username, user);
  // }

  // async unfollow(username: string, user: UserEntity): Promise<ProfileRO> {
  //   const userToFollow = await this.userRepository.findOne({ username });
  //   if (userToFollow === undefined) {
  //     throw new UserNotFoundException(`username: ${username}`);
  //   }

  //   const profile = await this.getProfile(username, user);

  //   if (!profile.profile.following) {
  //     return profile;
  //   }

  //   await this.userRepository
  //     .createQueryBuilder('user')
  //     .relation('followings')
  //     .of(user.id)
  //     .remove(userToFollow.id);

  //   profile.profile.following = false;
  //   // return profile;
  //   return await this.getProfile(username, user);
  // }

  async findByEmailAndPwd(
    loginUserDto: LoginUserDto,
  ): Promise<UserEntity | undefined> {
    const findOpts = {
      email: loginUserDto.email,
      password: hashPassword(loginUserDto.password),
    };
    return this.userRepository.findOne(findOpts);
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const { email, password, username } = createUserDto;
    const existingUser = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .orWhere('user.username = :username', {
        username,
      })
      .getOne();
    console.log(existingUser);

    if (existingUser) {
      throw new HttpException(
        {
          errors: { user: 'Username or email already exist.' },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const newUser = new UserEntity();
    newUser.password = password;
    newUser.username = username;
    newUser.email = email;

    return this.userRepository.save(newUser);
  }

  async update(userId: number, dto: UpdateUserDto): Promise<UserEntity> {
    const oldUserInfo = await this.userRepository.findOne({ id: userId });
    if (!oldUserInfo) {
      throw new HttpException(
        { errors: { user: 'Failed to find by id before update' } },
        HttpStatus.UNAUTHORIZED,
      );
    }
    // prevent to invoke `@BeforeInsert`
    delete oldUserInfo.password;

    // update old entity to trigger @BeforeUpdate
    Object.assign(oldUserInfo, dto);

    return this.userRepository.save(oldUserInfo);
  }

  async delete(email: string): Promise<DeleteResult> {
    return this.userRepository.delete({ email });
  }

  // private async checkIfAFollowingB(aId: number, bId: number): Promise<boolean> {
  //   const res = await this.userRepository.query(
  //     `SELECT * FROM follow_relation WHERE followerId = ? AND followeeId = ?`,
  //     [aId, bId],
  //   );
  //   if (Array.isArray(res) && res.length > 0) {
  //     return true;
  //   }

  //   return false;
  // }
}
