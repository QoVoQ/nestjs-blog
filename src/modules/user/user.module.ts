import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserController } from './user.controller';
import { CommonModule } from '../common/common.module';
import { JwtOptionalGuard } from '../auth/jwt-optional.guard';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService, JwtOptionalGuard],
  exports: [UserService, JwtOptionalGuard],
})
export class UserModule {}
