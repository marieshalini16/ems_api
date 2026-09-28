import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateMyTaskDto {
  @IsInt()
  status_id: number;

  @IsOptional()
  @IsString()
  comments?: string;
}