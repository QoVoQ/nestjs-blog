import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/decorators';
import { CreateArticleDto } from './dto';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@User() user, @Body() createArticleDto: CreateArticleDto) {
    return this.articleService.create(user, createArticleDto);
  }
}
