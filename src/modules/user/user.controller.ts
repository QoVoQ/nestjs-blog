import {
  Controller,
  Post,
  Req,
  UseGuards,
  Get,
  Put,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto';
import { MyValidationPipe } from 'src/pipes/my-validation-pipe';
import { UserEntity, UserRO } from './user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Put()
  // @UseGuards(AuthGuard('jwt'))
  // async update(
  //   @User() user: UserEntity,
  //   @Body(MyValidationPipe({ skipMissingProperties: true }))
  //   dto: UpdateUserDto,
  //   @JwtToken() token: string,
  // ): Promise<UserRO> {
  //   const userEntity = await this.userService.update(user.id, dto);

  //   return UserEntity.buildRO(userEntity, token);
  // }
}
