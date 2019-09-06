import { Profile } from '../profile/profile.interface';

export interface CommentData {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  body: string;
  author: Profile;
}
export interface CommentRO {
  comment: CommentData;
}

export interface CommentsRO {
  comments: CommentData[];
}
