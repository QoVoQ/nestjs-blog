import { Length, IsOptional } from 'class-validator';

export class UpdateArticleDto {
  @Length(1, 50)
  @IsOptional()
  readonly title?: string;
  @Length(1, 100)
  @IsOptional()
  readonly description?: string;
  @Length(1, 1e5)
  @IsOptional()
  readonly body?: string;
}
