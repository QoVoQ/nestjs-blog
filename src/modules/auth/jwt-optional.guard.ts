import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtFromRequest } from './constants';
import { JwtPayload } from './auth.interface';
import { UserService } from '../user';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class JwtOptionalGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest();
    const token = jwtFromRequest(request);

    if (request.user && request.user instanceof UserEntity) {
      return true;
    }

    let userId;
    let user;
    if (typeof token === 'string') {
      try {
        userId = ((await this.jwtService.verifyAsync(token)) as JwtPayload)
          .userId;
      } catch {
        throw new HttpException(
          { errors: { guard: 'Invalid access token.' } },
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    if (typeof userId === 'number') {
      try {
        user = await this.userService.findById(userId);
      } catch {
        throw new HttpException(
          { errors: { guard: 'User not exist.' } },
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    if (user instanceof UserEntity) {
      request.user = user;
    }

    return true;
  }
}
