import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './comment.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { ArticleEntity } from '../article/article.entity';
import { ProfileModule } from '../profile/profile.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity, ArticleEntity]),
    ProfileModule,
    AuthModule,
  ],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
