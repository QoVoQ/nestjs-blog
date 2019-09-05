import { Length, IsOptional } from 'class-validator';
export class CreateArticleDto {
  @Length(1, 50)
  readonly title: string;
  @Length(1, 100)
  readonly description: string;
  @Length(1, 1e5)
  readonly body: string;

  @Length(1, 20, { each: true })
  @IsOptional()
  readonly tagList?: string[];
}
