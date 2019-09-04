import {
  createParamDecorator,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { UserEntity } from 'src/modules/user/user.entity';

export const User = createParamDecorator(
  <K extends keyof UserEntity>(
    userProperty: K,
    req: Request,
  ): UserEntity | UserEntity[K] => {
    const user = req.user as UserEntity;
    if (!user) {
      throw new HttpException(
        { errors: { user: 'Failed to get user from header' } },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return userProperty ? user[userProperty] : user;
  },
);
