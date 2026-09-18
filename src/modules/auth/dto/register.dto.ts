import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  fullname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, {
    message: 'Phone number must contain exactly 10 digits',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5, {
    message: 'Password must be at least 5 characters',
  })
  password: string;
}