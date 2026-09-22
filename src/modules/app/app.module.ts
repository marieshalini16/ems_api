import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from "../prisma/prisma.module.js";
import { AuthModule } from '../auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from '../admin/admin.module.js';
import { EmployeeModule } from '../employee/employee.module.js';
import { EmployeesModule } from '../employees/employees.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    AdminModule,
    EmployeeModule,
    EmployeesModule,
  ],
  controllers: [AppController],
  providers: [AppService]
  ,
})

export class AppModule {}
