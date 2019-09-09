import { Profile } from '../profile/profile.interface';
import { PaginationQuery } from '../common/interface/query';

export interface ArticleROData {
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
}

export interface ArticleRO {
  article: ArticleROData;
}

export interface ArticleListRO {
  articles: ArticleROData[];
  articlesCount: number;
}

export interface ArticleGeneralQuery extends PaginationQuery {
  tag?: string;
  author?: string;
  favorited?: string;
}

export const ArticleEmptyListFactory = () => ({
  articles: [],
  articlesCount: 0,
});
