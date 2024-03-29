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
  UseFilters,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/decorators';
import { CreateArticleDto, UpdateArticleDto } from './dto';
import { MyValidationPipe } from 'src/pipes/my-validation-pipe';
import {
  ArticleRO,
  ArticleGeneralQuery,
  ArticleListRO,
} from './article.interface';
import { JwtOptionalGuard } from '../auth/jwt-optional.guard';
import { Request } from 'express';
import { UserEntity } from '../user/user.entity';
import { PaginationQuery } from '../common/interface/query';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  @UseGuards(JwtOptionalGuard)
  async findAll(
    @Query() query: ArticleGeneralQuery,
    @Req() req: Request,
  ): Promise<ArticleListRO> {
    return this.articleService.findAll(query, req.user as UserEntity);
  }

  @Get('feed')
  @UseGuards(AuthGuard('jwt'))
  async feed(
    @Query() query: PaginationQuery,
    @User() user: UserEntity,
  ): Promise<ArticleListRO> {
    return this.articleService.feed(query, user);
  }

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
  async delete(@User() user, @Param('slug') slug: string) {
    return this.articleService.delete(user, slug);
  }

  @Post(':slug/favorite')
  @UseGuards(AuthGuard('jwt'))
  async favourite(@User() user, @Param('slug') slug: string) {
    return this.articleService.favorite(user, slug);
  }

  @Delete(':slug/favorite')
  @UseGuards(AuthGuard('jwt'))
  async unfavorite(@User() user, @Param('slug') slug: string) {
    return this.articleService.unfavorite(user, slug);
  }
}
