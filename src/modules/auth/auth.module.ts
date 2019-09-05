import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { CommonModule } from '../common/common.module';
import { JwtOptionalGuard } from './jwt-optional.guard';

@Module({
  imports: [CommonModule, UserModule, PassportModule],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtOptionalGuard],
  controllers: [AuthController],
  // export UserModule, CommonModule for JwtOptionalGuard
  exports: [AuthService, JwtOptionalGuard, UserModule, CommonModule],
})
export class AuthModule {}
