import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { EmployeeService } from './employee.service.js';
import { AuthJwtGuard } from '../auth/auth.jwt.guard.js';
import { AuthRoleGuard } from '../auth/auth.role.guard.js';
import { Roles } from '../auth/auth.role.decorator.js';

@Controller('employee')
@UseGuards(AuthJwtGuard, AuthRoleGuard)
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
  ) {}

  @Get('dashboard')
  @Roles(2)
  getDashboard(@Req() request: any) {
    const userId = Number(request.user.userId);

    return this.employeeService.getDashboard(userId);
  }
}