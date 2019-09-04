import {
  Controller,
  Param,
  Get,
  Post,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { JwtToken, User } from 'src/decorators';
import { ProfileService } from './profile.service';
import { AuthGuard } from '@nestjs/passport';
import { ProfileRO } from './profile.interface';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfile(
    @Param('username') username: string,
    @JwtToken() token: string | null,
  ): Promise<ProfileRO> {
    return this.profileService.getProfile(username, token);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard('jwt'))
  async follow(
    @User() user,
    @Param('username') username: string,
  ): Promise<ProfileRO> {
    return this.profileService.follow(username, user);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard('jwt'))
  async unfollow(
    @User() user,
    @Param('username') username: string,
  ): Promise<ProfileRO> {
    return this.profileService.unfollow(username, user);
  }
}
