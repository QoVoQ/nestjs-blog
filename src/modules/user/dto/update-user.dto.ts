import { IsEmail, IsAlphanumeric, IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @IsAlphanumeric()
  @Length(1, 20)
  readonly username?: string;
  @IsEmail()
  readonly email?: string;
  @IsString()
  readonly bio?: string;
  @IsString()
  readonly image?: string;
  @IsString()
  @Length(6, 20)
  readonly password?: string;
}
