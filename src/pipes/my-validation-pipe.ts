import {
  ValidationPipe,
  HttpException,
  HttpStatus,
  ValidationPipeOptions,
} from '@nestjs/common';

export const MyValidationPipe = (opts: ValidationPipeOptions = {}) =>
  new ValidationPipe({
    exceptionFactory: errors =>
      new HttpException({ errors }, HttpStatus.UNPROCESSABLE_ENTITY),
    ...opts,
  });
