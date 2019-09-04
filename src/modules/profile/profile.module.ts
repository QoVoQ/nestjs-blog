import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule, UserModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
