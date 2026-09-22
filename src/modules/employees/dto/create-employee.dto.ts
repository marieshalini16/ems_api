import {IsDateString, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  full_name: string;

  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/)
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