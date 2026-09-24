import { IsIn, IsInt } from "class-validator";

export class UpdateDepartmentStatusDto {
  @IsInt()
  @IsIn([0, 1])
  is_active: number;
}