import {
  Controller,
  UseGuards,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtOptionalGuard } from '../auth/jwt-optional.guard';
import { CommentsRO, CommentRO } from './comment.interface';
import { User } from 'src/decorators/user.decorator';
import { MyValidationPipe } from 'src/pipes/my-validation-pipe';
import { UserEntity } from '../user/user.entity';
import { DeleteResult } from 'typeorm';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Request } from 'express';

@Controller('articles')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}
  @UseGuards(AuthGuard('jwt'))
  @Post(':slug/comments')
  async create(
    @User() user: UserEntity,
    @Param('slug') slug: string,
    @Body('comment', MyValidationPipe()) dto: CreateCommentDto,
  ): Promise<CommentRO> {
    return this.commentService.create(slug, dto, user);
  }

  @UseGuards(JwtOptionalGuard)
  @Get(':slug/comments')
  async get(
    @Req() req: Request,
    @Param('slug') slug: string,
  ): Promise<CommentsRO> {
    return this.commentService.findAll(slug, req.user as UserEntity);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':slug/comments/:id')
  async delete(
    @User() user: UserEntity,
    @Param('slug') slug: string,
    @Param('id') id: number,
  ): Promise<DeleteResult> {
    return this.commentService.delete(slug, id, user);
  }
}
