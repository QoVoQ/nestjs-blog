import {
  Controller,
  Post,
  Req,
  UseGuards,
  Get,
  Put,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto';
import { MyValidationPipe } from 'src/pipes/my-validation-pipe';
import { UserEntity, UserRO } from './user.entity';
import { User, JwtToken } from 'src/decorators';
import { ProfileRO } from '../profile/profile.interface';

@Controller('')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('user')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @User() user: UserEntity,
    @Body(MyValidationPipe({ skipMissingProperties: true }))
    dto: UpdateUserDto,
    @JwtToken() token: string,
  ): Promise<UserRO> {
    const userEntity = await this.userService.update(user.id, dto);

    return UserEntity.buildRO(userEntity, token);
  }

  @Get('profiles/:username')
  async getProfile(
    @Param('username') username: string,
    @JwtToken() token: string | null,
  ): Promise<ProfileRO> {
    return this.userService.getProfile(username, token);
  }

  @Post('profiles/:username/follow')
  @UseGuards(AuthGuard('jwt'))
  async follow(
    @User() user,
    @Param('username') username: string,
  ): Promise<ProfileRO> {
    return this.userService.follow(username, user);
  }

  @Delete('profiles/:username/follow')
  @UseGuards(AuthGuard('jwt'))
  async unfollow(
    @User() user,
    @Param('username') username: string,
  ): Promise<ProfileRO> {
    return this.userService.unfollow(username, user);
  }
}
