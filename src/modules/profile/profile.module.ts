import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ProfileController } from './profile.controller';

@Module({
  imports: [UserModule],
  controllers: [ProfileController],
  exports: [],
})
export class ProfileModule {}
