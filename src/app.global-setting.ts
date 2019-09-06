import { INestApplication } from '@nestjs/common';
import { EntityNotFoundExceptionFilter } from './filters/entity-not-found-exception.filter';

export function globalSetting(app: INestApplication) {
  app.useGlobalFilters(new EntityNotFoundExceptionFilter());
}
