import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { TagModule } from './tag/tag.module';
import { ArticleModule } from './article/article.module';
import { CommentModule } from './comment/comment.module';

export const featureModules = [
  CommonModule,
  UserModule,
  AuthModule,
  ProfileModule,
  TagModule,
  ArticleModule,
  CommentModule,
];
