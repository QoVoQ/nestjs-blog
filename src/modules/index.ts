import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { TagModule } from './tag';
import { ArticleModule } from './article';

export const featureModules = [
  CommonModule,
  UserModule,
  AuthModule,
  ProfileModule,
  TagModule,
  ArticleModule,
];
