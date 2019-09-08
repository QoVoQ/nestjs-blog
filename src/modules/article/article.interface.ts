import { Profile } from '../profile/profile.interface';
import { PaginationQuery } from '../common/interface/query';

export interface ArticleRO {
  article: {
    slug: string;
    title: string;
    description: string;
    body: string;
    tagList: string[];
    createdAt: Date;
    updatedAt: Date;
    favorited: boolean;
    favoritesCount: number;
    author: Profile;
  };
}

export interface ArticleListRO {
  articles: ArticleRO[];
  articlesCount: number;
}

export interface ArticleGeneralQuery extends PaginationQuery {
  tag?: string;
  author?: string;
  favorited?: string;
}
