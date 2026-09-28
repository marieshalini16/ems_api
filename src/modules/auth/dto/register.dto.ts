import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  fullname: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, {message: 'Phone number must contain exactly 10 digits'})
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Password must be at least 5 characters'})
  password: string;
}