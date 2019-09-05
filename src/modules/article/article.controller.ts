import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Req,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/decorators';
import { CreateArticleDto, UpdateArticleDto } from './dto';
import { MyValidationPipe } from 'src/pipes/my-validation-pipe';
import { ArticleRO } from './article.interface';
import { JwtOptionalGuard } from '../auth/jwt-optional.guard';
import { Request } from 'express';
import { UserEntity } from '../user/user.entity';
import { CreateUserDto } from '../user/dto';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get(':slug')
  @UseGuards(JwtOptionalGuard)
  async findBySlug(
    @Param('slug') slug: string,
    @Req() req: Request,
  ): Promise<ArticleRO> {
    return this.articleService.findBySlug(slug, req.user as UserEntity);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @User() user,
    @Body(MyValidationPipe())
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleRO> {
    return this.articleService.create(user, createArticleDto);
  }

  @Put(':slug')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @User() user,
    @Param('slug') slug: string,
    @Body(MyValidationPipe()) dto: UpdateArticleDto,
  ) {
    return this.articleService.update(user, slug, dto);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('slug') slug: string) {
    return this.articleService.delete(slug);
  }
}
