import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';

import { ProfileService } from './profile.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { AuthJwtGuard } from '../auth/auth.jwt.guard.js';

@Controller('profile')
@UseGuards(AuthJwtGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @Get()
  getProfile(@Req() req: any) {
    return this.profileService.getProfile(req.user.userId);
  }

  @Patch()
  updateProfile( @Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.userId,dto);
  }
}