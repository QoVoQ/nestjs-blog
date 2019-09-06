import { HttpException, HttpStatus } from '@nestjs/common';

export class ArticleEditPermissionException extends HttpException {
  constructor() {
    super(
      {
        errors: {
          article: `Only author can edit their article`,
        },
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
