import { HttpException, HttpStatus } from '@nestjs/common';

export class EditPermissionException extends HttpException {
  constructor() {
    super(
      {
        errors: {
          msg: `Only author can edit their content`,
        },
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
