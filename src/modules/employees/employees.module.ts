import { Module } from '@nestjs/common';

import { EmployeesController } from './employees.controller.js';
import { EmployeesService } from './employees.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule,
  ],
  
  controllers: [EmployeesController,
  ],
 
  providers: [EmployeesService,
  ],
 
  exports: [EmployeesService,
  ],
})

export class EmployeesModule {}

