import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  dept_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(225)
  description?: string;
}