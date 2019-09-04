import { NestMiddleware, Injectable } from '@nestjs/common';
import { Request } from 'express';
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res, next) {
    console.log(`****************${req.method} ${req.path}****************`);
    console.log(`Headers: ${JSON.stringify(req.headers)}`);
    console.log(`query: ${JSON.stringify(req.query)}`);
    console.log(`body: ${JSON.stringify(req.body)}`);
    console.log(`param: ${JSON.stringify(req.params)}`);
    next();
  }
}
