import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { jwtConstants } from './constants';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';

export interface JwtPayload {
  userId: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Token'),
      ignoreExpiration: true,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    const user = await this.userService.findById(payload.userId);
    if (!user) {
      throw new HttpException(
        { errors: { auth: 'Invalid username or password' } },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }
}
