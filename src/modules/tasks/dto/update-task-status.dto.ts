import { IsInt } from 'class-validator';

export class UpdateTaskStatusDto {
  @IsInt()
  status_id: number;
}