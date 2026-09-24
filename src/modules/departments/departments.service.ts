import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';
import { UpdateDepartmentStatusDto } from './dto/update-department-status.dto.js';
import { DepartmentQueryDto } from './dto/department-query.dto.js'

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // Create Department

  async create(dto: CreateDepartmentDto) {
    const existingDepartment = await this.prisma.department.findUnique({
        where: {
          dept_name: dto.dept_name,
        },
      });

    if (existingDepartment) {
      throw new ConflictException( 'Department already exists' );
    }

    return this.prisma.department.create({
      data: {
        dept_name: dto.dept_name,
        description: dto.description,
      },
    });
  }

  // Get All Departments

  async findAll(query: DepartmentQueryDto) {

    const { search, is_active, page = 1, limit = 5 } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(search
        ? {
            OR: [
              {
                dept_name: {
                  contains: search,
                },
              },
              {
                description: {
                  contains: search,
                },
              },
            ],
          }
        : {}),

      ...(is_active !== undefined
        ? {
            is_active,
          }
        : {}),
    };

    const [departments, total] = await Promise.all([this.prisma.department.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            id: 'asc',
          },
        }),

        this.prisma.department.count({
          where,
        }),
      ]);

    // --------------------------------
    // Employee Counts
    // --------------------------------

    const employeeCounts =
      await this.prisma.users.groupBy({
        by: ['dept_id'],
        where: {
          dept_id: {
            in: departments.map(
              (department) => department.id,
            ),
          },
        },
        _count: {
          id: true,
        },
      });

    const countMap = new Map(
      employeeCounts.map((item) => [
        item.dept_id,
        item._count.id,
      ]),
    );

    const departmentsWithCount =
      departments.map((department) => ({
        ...department,

        employee_count:
          countMap.get(department.id) ?? 0,
      }));

    return {
      data: departmentsWithCount,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get One Department

  async findOne(id: number) {
    const department = await this.prisma.department.findUnique({
        where: {
          id,
        },
      });

    if (!department) {
      throw new NotFoundException( 'Department not found' );
    }

    const employeeCount = await this.prisma.users.count({
        where: {
          dept_id: id,
        },
      });

    return {
      ...department,
      employee_count: employeeCount,
    };
  }

  // Update Department

  async update(id: number, dto: UpdateDepartmentDto ) {

    const department = await this.prisma.department.findUnique({
        where: {
          id,
        },
      });

    if (!department) {
      throw new NotFoundException( 'Department not found' );
    }

    if (dto.dept_name) {

      const existingDepartment = await this.prisma.department.findFirst({
          where: {
            dept_name: dto.dept_name,
            NOT: {
              id,
            },
          },
        });

      if (existingDepartment) {
        throw new ConflictException( 'Department already exists' );
      }
    }

    return this.prisma.department.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  // Update Status

  async updateStatus( id: number, dto: UpdateDepartmentStatusDto ) {

    const department = await this.prisma.department.findUnique({
        where: {
          id,
        },
      });

    if (!department) {
      throw new NotFoundException( 'Department not found' );
    }

    return this.prisma.department.update({
      where: {
        id,
      },
      data: {
        is_active: dto.is_active,
      },
    });
  }
  
}