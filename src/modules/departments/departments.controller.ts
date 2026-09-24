import { Body, Controller, UseGuards, Post, Query, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';

import { AuthJwtGuard } from '../auth/auth.jwt.guard.js';
import { AuthRoleGuard } from '../auth/auth.role.guard.js';
import { Roles } from '../auth/auth.role.decorator.js';
import { DepartmentsService } from './departments.service.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';
import { UpdateDepartmentStatusDto } from './dto/update-department-status.dto.js';
import { DepartmentQueryDto } from './dto/department-query.dto.js';
import { create } from 'domain';


@Controller('departments')
@UseGuards(AuthJwtGuard,AuthRoleGuard)
@Roles(1)
export class DepartmentsController {
    constructor(
        private readonly departmentsService: DepartmentsService,
      ) {}

    //Create Department
    @Post()
    create(@Body() dto:CreateDepartmentDto){
        return this.departmentsService.create(dto);
    }

    //Get all departments, search
   @Get()
   findAll(@Query() query: DepartmentQueryDto) {
    return this.departmentsService.findAll(query);
   }

   // Get one
    @Get(':id')
    findOne( @Param('id', ParseIntPipe) id: number ) {
        return this.departmentsService.findOne(id);
    }

    //Update
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, 
           @Body() dto: UpdateDepartmentDto ) {

        return this.departmentsService.update(id,dto);
    }

    //Update Status
    @Patch(':id/status')
    updateStatus( @Param('id', ParseIntPipe) id: number, 
                  @Body() dto: UpdateDepartmentStatusDto) {

        return this.departmentsService.updateStatus( id,dto);
    }
}
