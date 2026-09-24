import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';

import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { EmployeeQueryDto } from './dto/employee-query.dto.js';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

   //CREATE EMPLOYEE

  async create(dto: CreateEmployeeDto) {

    // Check email

    const existingEmail = await this.prisma.users.findUnique({
        where: {
          email: dto.email,
        },
      });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check username

    const existingUsername = await this.prisma.users.findUnique({
        where: {
          user_name: dto.user_name,
        },
      });

    if (existingUsername) {
      throw new ConflictException( 'Username already exists');
    }

    // Check department

    const department = await this.prisma.department.findUnique({
        where: {
          id: dto.dept_id,
        },
      });

    if (!department) {
      throw new NotFoundException( 'Department not found');
    }

    // Find employee role

    const employeeRole = await this.prisma.roles.findFirst({
        where: {
          role: 'employee',
          is_active: 1,
        },
      });

    if (!employeeRole) {
      throw new NotFoundException( 'Employee role not found');
    }

    // Create employee
    const hashedPassword = await bcrypt.hash(dto.password,10);

    const employee = await this.prisma.users.create({
        data: {
          full_name: dto.full_name,
          user_name: dto.user_name,
          email: dto.email,
          password: hashedPassword,
          phone: dto.phone,
          role_id: employeeRole.role_id,
          dept_id: dto.dept_id,
          designation: dto.designation,
          doj: dto.doj ? new Date(dto.doj) : null,
          is_active: 1,
        },
      });

    // Don't return password

    const { password, ...employeeResponse } = employee;

    return {
      message: 'Employee created successfully',
      employee: employeeResponse,
    };
  }

   // GET ALL EMPLOYEES

  async findAll(query: EmployeeQueryDto) {

    const { search, dept_id, is_active, page = 1, limit = 5 } = query;
    const skip = (page - 1) * limit;

    // Find employee role

    const employeeRole = await this.prisma.roles.findFirst({
        where: {
          role: 'employee',
        },
      });

    if (!employeeRole) {
      throw new NotFoundException('Employee role not found');
    }

    // Build filter

    const where: any = {
      role_id: employeeRole.role_id,
    };

    // Search
    if (search) {
      where.OR = [
        {
          full_name: {
            contains: search,
          },
        },
        {
          user_name: {
            contains: search,
          },
        },
        {
          email: {
            contains: search,
          },
        },
        {
          phone: {
            contains: search,
          },
        },
        {
          designation: {
            contains: search,
          },
        },
      ];
    }

    if (dept_id !== undefined) {
      where.dept_id = dept_id;
    }

    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    // Fetch employees + count

    const [employees, total] = await Promise.all([ this.prisma.users.findMany({
          where,
          skip,
          take: limit,

          select: {
            id: true,
            user_name: true,
            email: true,
            full_name: true,
            phone: true,
            role_id: true,
            dept_id: true,
            designation: true,
            doj: true,
            is_active: true,
            created_at: true,
            updated_at: true,
          },

          orderBy: {
            id: 'desc',
          },
        }),

        this.prisma.users.count({
          where,
        }),
      ]);

    // Get department information

    const departmentIds = [...new Set(
        employees.map(
          (employee) => employee.dept_id,
        ),
      ),
    ];

    const departments = await this.prisma.department.findMany({
        where: {
          id: {
            in: departmentIds,
          },
        },
      });

    const departmentMap = new Map(
      departments.map((department) => [
        department.id,
        department,
      ]),
    );

    // Attach department

    const employeesWithDepartment =
      employees.map((employee) => ({
        ...employee,

        department: departmentMap.get(employee.dept_id) ?? null,
      }));

    return {
      data: employeesWithDepartment,

      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(
          total / limit,
        ),
      },
    };
  }

  // GET EMPLOYEE BY ID

  async findOne(id: number) {
    const employee = await this.prisma.users.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          user_name: true,
          email: true,
          full_name: true,
          phone: true,
          role_id: true,
          dept_id: true,
          designation: true,
          doj: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        },
      });

    if (!employee) {
      throw new NotFoundException( 'Employee not found' );
    }

    // Verify this is actually an employee

    const employeeRole = await this.prisma.roles.findFirst({
        where: {
          role: 'employee',
        },
      });

    if ( !employeeRole || employee.role_id !== employeeRole.role_id ) {
      throw new NotFoundException( 'Employee not found' );
    }

    // Get department

    const department = await this.prisma.department.findUnique({
        where: {
          id: employee.dept_id,
        },
      });

    return {
      ...employee,
      department,
    };
  }

  // UPDATE EMPLOYEE

  async update(id: number,dto: UpdateEmployeeDto) {
    const employee = await this.prisma.users.findUnique({
        where: {
          id,
        },
      });

    if (!employee) {
      throw new NotFoundException( 'Employee not found');
    }

    // Check email uniqueness

    if ( dto.email && dto.email !== employee.email
    ) {
      const existingEmail = await this.prisma.users.findUnique({
          where: {
            email: dto.email,
          },
        });

      if (existingEmail) {
        throw new ConflictException( 'Email already exists' );
      }
    }

    // Check username uniqueness
 
    if ( dto.user_name && dto.user_name !== employee.user_name
    ) {
      const existingUsername = await this.prisma.users.findUnique({
          where: {
            user_name: dto.user_name,
          },
        });

      if (existingUsername) {
        throw new ConflictException( 'Username already exists' );
      }
    }

    // Check department

    if (dto.dept_id !== undefined) {
      const department = await this.prisma.department.findUnique({
          where: {
            id: dto.dept_id,
          },
        });

      if (!department) {
        throw new NotFoundException( 'Department not found' );
      }
    }

    // Prepare update data
    const updateData: any = {
        full_name: dto.full_name,
        user_name: dto.user_name,
        email: dto.email,
        phone: dto.phone,
        dept_id: dto.dept_id,
        designation: dto.designation,
    };

    if (dto.doj) {
        updateData.doj = new Date(dto.doj);
    }

    if (dto.password) {
        updateData.password = await bcrypt.hash(dto.password, 10);
    }

    Object.keys(updateData).forEach((key) => {
    if (updateData[key] === undefined) {
        delete updateData[key];
    }
    });

    // Update

    const updatedEmployee = await this.prisma.users.update({
        where: {
            id,
        },

        data: updateData,

        select: {
            id: true,
            user_name: true,
            email: true,
            full_name: true,
            phone: true,
            role_id: true,
            dept_id: true,
            designation: true,
            doj: true,
            is_active: true,
            created_at: true,
            updated_at: true,
        },
        });

    return {
      message: 'Employee updated successfully',
      employee: updatedEmployee,
    };
  }

  // UPDATE EMPLOYEE STATUS

  async updateStatus(id: number,is_active: number) {
    const employee = await this.prisma.users.findUnique({
        where: {
          id,
        },
      });

    if (!employee) {
      throw new NotFoundException( 'Employee not found' );
    }

    const updatedEmployee = await this.prisma.users.update({
        where: {
          id,
        },

        data: {
          is_active,
        },

        select: {
          id: true,
          user_name: true,
          email: true,
          full_name: true,
          phone: true,
          role_id: true,
          dept_id: true,
          designation: true,
          doj: true,
          is_active: true,
        },
      });

    return {
      message:
        is_active === 1
          ? 'Employee activated successfully'
          : 'Employee deactivated successfully',

      employee: updatedEmployee,
    };
  }
  
}