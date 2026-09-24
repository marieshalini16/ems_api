import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  dept_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(225)
  description?: string;
}