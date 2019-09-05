import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtPayload } from './auth.interface';
import { jwtConstants, jwtFromRequest } from './constants';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest,
      ignoreExpiration: true,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    let user;
    try {
      user = await this.userService.findById(payload.userId);
    } catch {
      throw new HttpException(
        { errors: { auth: 'User not exist' } },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }
}
