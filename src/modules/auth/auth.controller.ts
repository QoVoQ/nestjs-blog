import {
  Controller,
  UseGuards,
  Post,
  Req,
  Body,
  Get,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto';
import { JwtToken } from 'src/decorators/jwt-token.decorator';
import { MyValidationPipe } from 'src/pipes/my-validation-pipe';
import { UserEntity, UserRO } from '../user/user.entity';
import { User } from 'src/decorators';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('users/login')
  @UseGuards(AuthGuard('local'))
  async login(@User() user: UserEntity): Promise<UserRO> {
    return this.authService.login(user);
  }

  @Post('users')
  @UsePipes(MyValidationPipe())
  async register(@Body() dto: CreateUserDto): Promise<UserRO> {
    return this.authService.register(dto);
  }

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  async findSelf(
    @User() user: UserEntity,
    @JwtToken() token: string,
  ): Promise<UserRO> {
    return UserEntity.buildRO(user, token);
  }
}
