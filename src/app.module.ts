import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLoggerMiddleware } from './shared/middleware/requestLogger.middleware';
import { featureModules } from './modules';

@Module({
  imports: [TypeOrmModule.forRoot(), ...featureModules],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('/');
  }
}
