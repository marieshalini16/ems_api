import { IsIn, IsInt } from 'class-validator';

export class UpdateEmployeeStatusDto {
  @IsInt()
  @IsIn([0, 1])
  is_active: number;
}