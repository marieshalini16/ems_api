import { Controller , Get, UseGuards,} from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { AuthJwtGuard } from '../auth/auth.jwt.guard.js';
import { AuthRoleGuard } from '../auth/auth.role.guard.js';
import { Roles } from '../auth/auth.role.decorator.js';


@Controller('admin')
@UseGuards(AuthJwtGuard, AuthRoleGuard)
export class AdminController {
  constructor( private readonly adminService: AdminService) {}

  @Get('dashboard')
  @Roles(1)
  getDashboard() {
    return this.adminService.getDashboard();
  }
}
