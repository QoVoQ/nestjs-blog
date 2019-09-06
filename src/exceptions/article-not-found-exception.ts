import { HttpException, HttpStatus } from '@nestjs/common';

export class ArticleNotFoundException extends HttpException {
  constructor() {
    super(
      {
        errors: {
          article: `Article not found`,
        },
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
