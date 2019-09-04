import { IsEmail, IsString, Length } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  readonly email: string;
  @IsString()
  @Length(6, 20)
  readonly password: string;
}
