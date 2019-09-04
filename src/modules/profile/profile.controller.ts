import {
  Controller,
  Param,
  Get,
  Post,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { JwtToken, User } from 'src/decorators';
import { AuthGuard } from '@nestjs/passport';
import { ProfileRO } from './profile.interface';
import { UserService } from '../user/user.service';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly userService: UserService) {}

  @Get(':username')
  async getProfile(
    @Param('username') username: string,
    @JwtToken() token: string | null,
  ): Promise<ProfileRO> {
    return this.userService.getProfile(username, token);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard('jwt'))
  async follow(
    @User() user,
    @Param('username') username: string,
  ): Promise<ProfileRO> {
    return this.userService.follow(username, user);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard('jwt'))
  async unfollow(
    @User() user,
    @Param('username') username: string,
  ): Promise<ProfileRO> {
    return this.userService.unfollow(username, user);
  }
}
