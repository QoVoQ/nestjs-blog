import { Profile } from '../profile';

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
    favoriteCount: number;
    author: Profile;
  };
}
