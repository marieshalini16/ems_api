import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class TaskQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  priority_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  status_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  assign_to?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}