import { IsEmail, Length, IsString, IsAlphanumeric } from 'class-validator';

export class CreateUserDto {
  @IsAlphanumeric()
  @Length(1, 20)
  readonly username: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @Length(6, 20)
  readonly password: string;
}
