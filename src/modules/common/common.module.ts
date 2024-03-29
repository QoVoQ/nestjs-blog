import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';

const JwtMD = JwtModule.register({
  secret: jwtConstants.secret,
  signOptions: {
    expiresIn: '30d',
  },
});
@Module({
  imports: [JwtMD],
  providers: [],
  exports: [JwtMD],
})
export class CommonModule {}
