import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule, UserModule],
  providers: [ProfileService],
  controllers: [ProfileController],
  exports: [ProfileService],
})
export class ProfileModule {}
