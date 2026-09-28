import { Module } from '@nestjs/common';

import { MyTaskController } from './mytask.controller.js';
import { MyTaskService } from './mytask.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports:[AuthModule],
  controllers: [MyTaskController],
  providers: [MyTaskService]
})
export class MytaskModule {}
