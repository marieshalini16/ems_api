import { Body, Controller, Get, Param, Patch, Req, UseGuards} from '@nestjs/common';

import { MyTaskService } from './mytask.service.js';
import { UpdateMyTaskDto } from './dto/update-my-task.dto.js';
import { AuthJwtGuard } from '../auth/auth.jwt.guard.js';

@Controller('mytask')
@UseGuards(AuthJwtGuard)
export class MyTaskController {
  constructor(
    private readonly myTaskService: MyTaskService,
  ) {}

  @Get()
  getMyTasks(@Req() req: any) {
    return this.myTaskService.getMyTasks(req.user.userId);
  }

  @Patch(':id')
  updateMyTask(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateMyTaskDto) {
    return this.myTaskService.updateMyTask(Number(id),req.user.userId,dto);
  }

  @Get("statuses")
  getStatuses() {
  return this.myTaskService.getStatuses();
  }
}