import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult, FindConditions } from 'typeorm';
import { hashPassword } from 'src/shared/utils';
import { UserEntity } from './user.entity';
import { LoginUserDto, CreateUserDto, UpdateUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { UserNotFoundException } from 'src/exceptions/user-not-found.exception';
import { ProfileRO } from '../profile/profile.interface';
import { JwtPayload } from '../auth/jwt.strategy';

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

  async findOne(filterObj: FindConditions<UserEntity>): Promise<UserEntity> {
    return this.userRepository.findOne(filterObj);
  }

  async createFollowRelation(followerId: number, followeeId: number) {
    return this.userRepository
      .createQueryBuilder('user')
      .relation('followings')
      .of(followerId)
      .add(followeeId);
  }

  async removeFollowRelation(followerId: number, followeeId: number) {
    return this.userRepository
      .createQueryBuilder('user')
      .relation('followings')
      .of(followerId)
      .remove(followeeId);
  }

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

  async checkIfAFollowingB(aId: number, bId: number): Promise<boolean> {
    const res = await this.userRepository.query(
      `SELECT * FROM follow_relation WHERE followerId = ? AND followeeId = ?`,
      [aId, bId],
    );
    if (Array.isArray(res) && res.length > 0) {
      return true;
    }

    return false;
  }
}
