import { Length } from 'class-validator';

export class CreateCommentDto {
  @Length(1, 500)
  body: string;
}
