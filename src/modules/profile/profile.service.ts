import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';
import { UserNotFoundException } from 'src/exceptions/user-not-found.exception';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth';
import { ProfileRO } from './profile.interface';

@Injectable()
export class ProfileService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async getProfile(
    username: string,
    token: string | UserEntity | null,
  ): Promise<ProfileRO> {
    const userBeingChecked = await this.userService.findOne({ username });
    if (userBeingChecked === undefined) {
      return {
        profile: null,
      };
    }

    let userIdChecking: number;
    if (typeof token === 'string') {
      // use exception filter here?
      // handle exception when token verification fail, throw other exceptions
      try {
        userIdChecking = ((await this.jwtService.verifyAsync(
          token,
        )) as JwtPayload).userId;
      } catch (e) {
        throw new HttpException(
          { errors: { profile: 'Get profile with Invalid token ' } },
          HttpStatus.UNAUTHORIZED,
        );
      }
    } else if (token instanceof UserEntity) {
      userIdChecking = token.id;
    }

    const following =
      typeof userIdChecking === 'number'
        ? await this.userService.checkIfAFollowingB(
            userIdChecking,
            userBeingChecked.id,
          )
        : false;

    return userBeingChecked.buildProfile(following);
  }

  async follow(username: string, user: UserEntity): Promise<ProfileRO> {
    if (username === user.username) {
      throw new HttpException(
        { errors: { follow: 'Self follow not permitted.' } },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const userToFollow = await this.userService.findOne({ username });
    if (userToFollow === undefined) {
      throw new UserNotFoundException(`username: ${username}`);
    }

    const profile = await this.getProfile(username, user);

    if (profile.profile.following) {
      return profile;
    }

    await this.userService.createFollowRelation(user.id, userToFollow.id);

    profile.profile.following = true;
    // return profile;
    return this.getProfile(username, user);
  }

  async unfollow(username: string, user: UserEntity): Promise<ProfileRO> {
    const userToUnfollow = await this.userService.findOne({ username });
    if (userToUnfollow === undefined) {
      throw new UserNotFoundException(`username: ${username}`);
    }

    const profile = await this.getProfile(username, user);

    if (!profile.profile.following) {
      return profile;
    }

    await this.userService.removeFollowRelation(user.id, userToUnfollow.id);

    profile.profile.following = false;
    // return profile;
    return this.getProfile(username, user);
  }
}
