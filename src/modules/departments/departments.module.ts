import { Module } from '@nestjs/common';

import { DepartmentsController } from './departments.controller.js';
import { DepartmentsService } from './departments.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports:[AuthModule],
  controllers: [DepartmentsController],
  providers: [DepartmentsService]
})
export class DepartmentsModule {}
