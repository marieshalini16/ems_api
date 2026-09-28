import {IsDateString, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  full_name: string;

  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Phone must be exactly 10 digits' })
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  password: string;

  @IsInt()
  dept_id: number;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsDateString()
  doj?: string;
}