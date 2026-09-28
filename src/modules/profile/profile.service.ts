import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  // Get profile
  async getProfile(userId: number) {
    
    const user = await this.prisma.users.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        user_name: true,
        email: true,
        full_name: true,
        phone: true,
        doj: true,
        designation: true,
        dept_id: true,
        role_id: true,
        is_active: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const department = await this.prisma.department.findUnique({
      where: {
        id: user.dept_id,
      },
      select: {
        id: true,
        dept_name: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      doj: user.doj,
      designation: user.designation,
      department: department,
      is_active: user.is_active,
    };
  }

  // Update profile
  async updateProfile( userId: number, dto: UpdateProfileDto) {
    
    const user = await this.prisma.users.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        ...(dto.full_name !== undefined && {full_name: dto.full_name}),

        ...(dto.phone !== undefined && {phone: dto.phone}),
      },
      select: {
        id: true,
        user_name: true,
        email: true,
        full_name: true,
        phone: true,
        doj: true,
        designation: true,
        dept_id: true,
        role_id: true,
        is_active: true,
      },
    });

    const department = await this.prisma.department.findUnique({
      where: {
        id: updatedUser.dept_id,
      },
      select: {
        id: true,
        dept_name: true,
      },
    });

    const role = await this.prisma.roles.findUnique({
      where: {
        role_id: updatedUser.role_id,
      },
      select: {
        role_id: true,
        role: true,
      },
    });

    return {
      message: 'Profile updated successfully',

      profile: {
        id: updatedUser.id,
        user_name: updatedUser.user_name,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        phone: updatedUser.phone,
        doj: updatedUser.doj,
        designation: updatedUser.designation,
        department: department,
        role: role,
        is_active: updatedUser.is_active,
      },
    };
  }
}