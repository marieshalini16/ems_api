import { Body, Controller, Delete, Get, Param, ParseIntPipe, Query, Req, UseGuards, Patch, Post} from '@nestjs/common';

import { TasksService } from './tasks.service.js';

import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskQueryDto } from './dto/task-query.dto.js';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto.js';

import { AuthJwtGuard } from '../auth/auth.jwt.guard.js';
import { AuthRoleGuard } from '../auth/auth.role.guard.js';
import { Roles } from '../auth/auth.role.decorator.js';

@Controller('tasks')
@UseGuards(AuthJwtGuard, AuthRoleGuard)
@Roles(1)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) {}

  @Post()
  create( @Body() dto: CreateTaskDto, @Req() req: any) {
    return this.tasksService.create(dto,req.user.userId);
  }

  @Get()
  findAll(@Query() query: TaskQueryDto) {
    return this.tasksService.findAll(query);
  }

  @Get('priorities')
  getPriorities() {
    return this.tasksService.getPriorities();
  }

  @Get('statuses')
  getStatuses() {
    return this.tasksService.getStatuses();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number,
         @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id,dto);
  }

  @Patch(':id/status')
  updateStatus( @Param('id', ParseIntPipe) id: number,
                @Body() dto: UpdateTaskStatusDto) {
    return this.tasksService.updateStatus(id,dto);
  }

  @Delete(':id')
  remove( @Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}