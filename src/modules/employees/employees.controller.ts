import { Body, Controller, UseGuards, Post, Query, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';

import { AuthJwtGuard } from '../auth/auth.jwt.guard.js';
import { AuthRoleGuard } from '../auth/auth.role.guard.js';
import { Roles } from '../auth/auth.role.decorator.js';
import { EmployeesService } from './employees.service.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { EmployeeQueryDto } from './dto/employee-query.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { UpdateEmployeeStatusDto } from './dto/update-employee-status.dto.js';

@Controller('employees')
@UseGuards(AuthJwtGuard,AuthRoleGuard)
@Roles(1)
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
  ) {}

  //Create employee
  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  //Get all employees, filter, search
  @Get()
  findAll(@Query() query: EmployeeQueryDto) {
    return this.employeesService.findAll(query);
  }

  //Get one employee by id
  @Get(':id')
  findOne( @Param('id', ParseIntPipe) id: number ) {
    return this.employeesService.findOne(id);
  }

  //Update a employee data
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmployeeDto ) {
    return this.employeesService.update(id,dto);
  }
 
  //Update the status of employee
  @Patch(':id/status')
  updateStatus( @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmployeeStatusDto) {
    return this.employeesService.updateStatus( id,dto.is_active);
  }

}