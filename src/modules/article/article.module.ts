import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ArticleEntity } from "./article.entity";
import { TagModule } from "../tag";
import { ArticleService } from "./article.service";

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity]), TagModule],
  providers: [ArticleService],
  controllers: [ArticleController]
})
