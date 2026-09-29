import { ConflictException, Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';
import { UpdateDepartmentStatusDto } from './dto/update-department-status.dto.js';
import { DepartmentQueryDto } from './dto/department-query.dto.js'

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);
  constructor( private readonly prisma: PrismaService ) {}

  // Create Department

  async create(dto: CreateDepartmentDto) {
    try{
    const existingDepartment = await this.prisma.department.findUnique({
        where: {
          dept_name: dto.dept_name,
        },
      });

    if (existingDepartment) {
      throw new ConflictException( 'Department already exists' );
    }

  this.logger.log('Department created successfully');

    return this.prisma.department.create({
      data: {
        dept_name: dto.dept_name,
        description: dto.description,
      },
    });
  }
  catch(error){
    if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }

    this.logger.error( 'Failed to create department', error instanceof Error ? error.stack : String(error) );
    throw new InternalServerErrorException('Failed to create department');

  }
  }

  // Get All Departments

  async findAll(query: DepartmentQueryDto) {
    try{

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

      ...(is_active !== undefined ? { is_active, } : {}),
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


    const employeeCounts = await this.prisma.users.groupBy({
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

    const departmentsWithCount = departments.map((department) => ({
        ...department,

        employee_count:
          countMap.get(department.id) ?? 0,
      }));

    this.logger.log('Department fetched successfully');

    return {
      data: departmentsWithCount,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  catch(error){
    if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }

    this.logger.error( 'Failed to fetch department', error instanceof Error ? error.stack : String(error) );
    throw new InternalServerErrorException('Failed to fetch department');
  }
  }

  // Get One Department

  async findOne(id: number) {
    try{
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
    
    this.logger.log(`Department id=${id} fetched successfully`);

    return {
      ...department,
      employee_count: employeeCount,
    };
  }
  catch(error){
    if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
    this.logger.error( `Failed to fetch department id=${id}: ${(error as Error).message}`, (error as Error).stack, );
      
    throw new InternalServerErrorException('Failed to fetch department');
  }
  }

  // Update Department

  async update(id: number, dto: UpdateDepartmentDto ) {

  try{
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

    this.logger.log(`Department id=${id} updated successfully`);

    return this.prisma.department.update({
      where: {
        id,
      },
      data: dto,
    });
  }
  catch(error){
    if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
    this.logger.error( `Failed to update department id=${id}: ${(error as Error).message}`, (error as Error).stack, );
      
    throw new InternalServerErrorException('Failed to update department');   
  }
  }

  // Update Status

  async updateStatus( id: number, dto: UpdateDepartmentStatusDto ) {
    
    try{

    const department = await this.prisma.department.findUnique({
        where: {
          id,
        },
      });

    if (!department) {
      throw new NotFoundException( 'Department not found' );
    }

    this.logger.log(`Department id=${id} status updated successfully`);

    return this.prisma.department.update({
      where: {
        id,
      },
      data: {
        is_active: dto.is_active,
      },
    });
  }
  catch(error){
    if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }

    this.logger.error( `Failed to update department status id=${id}: ${(error as Error).message}`, (error as Error).stack);
    throw new InternalServerErrorException('Failed to update department status'); 
  }
  }
  
}