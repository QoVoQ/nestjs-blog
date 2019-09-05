import {
  Controller,
  Param,
  Get,
  Post,
  UseGuards,
  Delete,
  Req,
} from '@nestjs/common';
import { JwtToken, User } from 'src/decorators';
import { AuthGuard } from '@nestjs/passport';
import { ProfileRO } from './profile.interface';
import { ProfileService } from './profile.service';
import { JwtOptionalGuard } from '../auth/jwt-optional.guard';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  @UseGuards(JwtOptionalGuard)
  async getProfile(
    @Param('username') username: string,
    @Req() req,
  ): Promise<ProfileRO> {
    return this.profileService.getProfile(username, req.user);
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
