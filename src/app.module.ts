import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RequestLoggerMiddleware } from './shared/middleware/requestLogger.middleware';
import { featureModules } from './modules';
import { ormConfig } from './config/orm-config';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig as TypeOrmModuleAsyncOptions),
    ...featureModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('/');
  }
}
