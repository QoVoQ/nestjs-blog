import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch(EntityNotFoundError)
export class EntityNotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: EntityNotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      errors: { entityNotFound: exception.message },
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
    });
  }
}
