import { Module } from '@nestjs/common';
import { TestDBModule } from './test-db/test-db.module';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { featureModules } from 'src/modules';

@Module({
  imports: [TestDBModule.forRoot(), ...featureModules],
  controllers: [AppController],
  providers: [AppService],
})
export class AppTestModule {}
