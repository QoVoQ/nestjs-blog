import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserEntity, UserRO } from '../user/user.entity';
import { CreateUserDto } from '../user/dto';
import { JwtPayload } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.userService.findByEmailAndPwd({
      email,
      password,
    });

    return user || null;
  }

  async register(createUserDto: CreateUserDto): Promise<UserRO> {
    const user = await this.userService.create(createUserDto);
    return this.signUser(user);
  }

  async login(user: UserEntity): Promise<UserRO> {
    return this.signUser(user);
  }

  private signUser(user: UserEntity): UserRO {
    const payloadToSign: JwtPayload = { userId: user.id };
    const token = this.jwtService.sign(payloadToSign);

    return UserEntity.buildRO(user, token);
  }
}
