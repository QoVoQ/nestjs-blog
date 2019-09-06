import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { globalSetting } from './app.global-setting';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  globalSetting(app);
  await app.listen(3000);
}
bootstrap();
