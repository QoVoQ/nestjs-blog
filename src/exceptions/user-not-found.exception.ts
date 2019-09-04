import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(msg) {
    super(
      {
        errors: {
          user: `Failed to find user, ${msg}`,
        },
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
