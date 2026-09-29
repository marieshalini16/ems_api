import { ConflictException, Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskQueryDto } from './dto/task-query.dto.js';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto.js';

@Injectable()
export class TasksService {

  private readonly logger = new Logger(TasksService.name);

  constructor( private readonly prisma: PrismaService, ) {}

  // CREATE TASK

  async create( dto: CreateTaskDto, createdBy: number,) {

    try{    
    // Check assigned employee
    const employee = await this.prisma.users.findUnique({
        where: {
          id: dto.assign_to,
        },

        select: {
          id: true,
          role_id: true,
          is_active: true,
        },
      });

    if (!employee) {
      throw new NotFoundException( 'Assigned employee not found');
    }

    if (employee.is_active !== 1) {
      throw new ConflictException( 'Cannot assign task to inactive employee' );
    }

    // Check priority

    const priority = await this.prisma.priority.findUnique({
        where: {
          id: dto.priority_id,
        },
      });

    if (!priority) {
      throw new NotFoundException('Priority not found');
    }

    if (priority.is_active !== 1) {
      throw new ConflictException('Priority is inactive');
    }

    // Check status

    const status = await this.prisma.status.findUnique({
        where: {
          id: dto.status_id,
        },
      });

    if (!status) {
      throw new NotFoundException('Status not found');
    }

    if (status.is_active !== 1) {
      throw new ConflictException('Status is inactive');
    }

    // Create task

    const task = await this.prisma.tasks.create({
        data: {
          title: dto.title,
          description: dto.description,
          assign_to: dto.assign_to,
          created_by: createdBy,
          due_date: dto.due_date ? new Date(dto.due_date) : null,
          priority_id: dto.priority_id,
          status_id: dto.status_id,
          comments: dto.comments,
          is_active: 1,
        },
      });

    this.logger.log('Task created successfully');

    return {
      message: 'Task created successfully',
      task,
    };
  }
  catch(error){
     if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }

    this.logger.error( 'Failed to create tasks', error instanceof Error ? error.stack : String(error) );
    throw new InternalServerErrorException('Failed to create tasks');
  }
  }

  // GET ALL TASKS

  async findAll(query: TaskQueryDto) {
    
    try{

    const { search, priority_id, status_id, assign_to, page = 1, limit = 5} = query;
    const skip = (page - 1) * limit;

    const where: any = {
      is_active: 1,
    };

    // Search

    if (search) {

      const employees = await this.prisma.users.findMany({
          where: {
            full_name: {
              contains: search,
            },
          },

          select: {
            id: true,
          },
        });

      const employeeIds = employees.map( (employee) => employee.id);

       const priorities = await this.prisma.priority.findMany({
          where: { 
            priority_name: { contains: search } 
          },
          select: { 
            id: true
          },
  });

  const priorityIds = priorities.map((priority) => priority.id);

      where.OR = [
        {
          title: {
            contains: search,
          },
        },
        {
          description: {
            contains: search,
          },
        },
        ...(employeeIds.length > 0
          ? [
              {
                assign_to: {
                  in: employeeIds,
                },
              },
            ]: []),

          ...(priorityIds.length > 0 
            ? [
              { priority_id: { 
                in: priorityIds 
              }, 
            }] : []),
      ];
    }

    // Priority filter
    if (priority_id !== undefined) {
      where.priority_id = priority_id;
    }

    // Status filter
    if (status_id !== undefined) {
      where.status_id = status_id;
    }

    // Employee filter
    if (assign_to !== undefined) {
      where.assign_to = assign_to;
    }

    // Get tasks and total

    const [tasks, total] = await Promise.all([
        
        this.prisma.tasks.findMany({//tasks
          where,
          skip,
          take: limit,

          orderBy: {
            id: 'desc',
          },
        }),

        this.prisma.tasks.count({//count
          where,
        }),
      ]);

    // Get employee IDs

    const employeeIds = [...new Set(tasks.map(
          (task) => task.assign_to,
        ),
      ),
    ];

    // Get creator IDs

    const creatorIds = [...new Set(tasks.map(
          (task) => task.created_by,
        ),
      ),
    ];

    // Get employees

    const employees = employeeIds.length > 0
        ? await this.prisma.users.findMany({
            where: {
              id: {
                in: employeeIds,
              },
            },

            select: {
              id: true,
              full_name: true,
              user_name: true,
              email: true,
            },
          })
        : [];

    // Get creators

    const creators = creatorIds.length > 0
        ? await this.prisma.users.findMany({
            where: {
              id: {
                in: creatorIds,
              },
            },

            select: {
              id: true,
              full_name: true,
              user_name: true,
            },
          })
        : [];

    // Get priorities

    const priorityIds = [...new Set(tasks.map(
          (task) => task.priority_id,
        ),
      ),
    ];

    const priorities = priorityIds.length > 0
        ? await this.prisma.priority.findMany({
            where: {
              id: {
                in: priorityIds,
              },
            },
          })
        : [];

    // Get statuses

    const statusIds = [...new Set(tasks.map(
          (task) => task.status_id,
        ),
      ),
    ];

    const statuses = statusIds.length > 0
        ? await this.prisma.status.findMany({
            where: {
              id: {
                in: statusIds,
              },
            },
          })
        : [];

    // Maps

    const employeeMap = new Map(employees.map((employee) => [
        employee.id,
        employee,
      ]),
    );

    const creatorMap = new Map(creators.map((creator) => [
        creator.id,
        creator,
      ]),
    );

    const priorityMap = new Map(priorities.map((priority) => [
        priority.id,
        priority,
      ]),
    );

    const statusMap = new Map(statuses.map((status) => [
        status.id,
        status,
      ]),
    );

    // Attach related data

    const tasksWithDetails = tasks.map((task) => ({
        ...task,

        assigned_employee: employeeMap.get(task.assign_to) ?? null,

        created_by_user: creatorMap.get(task.created_by) ?? null,

        priority: priorityMap.get(task.priority_id) ?? null,

        status: statusMap.get(task.status_id) ?? null,
      }));

    this.logger.log('Fetched the tasks successfully');

    return {
      data: tasksWithDetails,

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
  catch(error){
    if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }

    this.logger.error( 'Failed to fetch tasks', error instanceof Error ? error.stack : String(error) );
    throw new InternalServerErrorException('Failed to fetch tasks');
  }
  }

  // GET TASK BY ID

  async findOne(id: number) {
    try{

    const task = await this.prisma.tasks.findUnique({
        where: {
          id,
        },
      });

    if (!task) {
      throw new NotFoundException('Task not found',);
    }

    const [assignedEmployee, createdBy, priority, status] = await Promise.all([
      
        this.prisma.users.findUnique({
        where: {
          id: task.assign_to,
        },

        select: {
          id: true,
          full_name: true,
          user_name: true,
          email: true,
        },
      }),

      this.prisma.users.findUnique({
        where: {
          id: task.created_by,
        },

        select: {
          id: true,
          full_name: true,
          user_name: true,
        },
      }),

      this.prisma.priority.findUnique({
        where: {
          id: task.priority_id,
        },
      }),

      this.prisma.status.findUnique({
        where: {
          id: task.status_id,
        },
      }),
    ]);

    this.logger.log(`Fetched task id=${id} successfully`);

    return {
      ...task,
      assigned_employee: assignedEmployee,
      created_by_user: createdBy,
      priority,
      status,
    };
  }
    catch(error){
    if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
    this.logger.error( `Failed to fetch task id=${id}: ${(error as Error).message}`, (error as Error).stack, );
    throw new InternalServerErrorException('Failed to fetch task');
  }
  }

  // UPDATE TASK

  async update(id: number, dto: UpdateTaskDto) {
    try{
   
    const task = await this.prisma.tasks.findUnique({
        where: {
          id,
        },
      });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check employee

    if (dto.assign_to !== undefined) {
      
      const employee = await this.prisma.users.findUnique({
          where: {
            id: dto.assign_to,
          },
        });

      if (!employee) {
        throw new NotFoundException('Assigned employee not found');
      }

      if (employee.is_active !== 1) {
        throw new ConflictException('Cannot assign task to inactive employee');
      }
    }

    // Check priority

    if (dto.priority_id !== undefined) {
     
      const priority = await this.prisma.priority.findUnique({
          where: {
            id: dto.priority_id,
          },
        });

      if (!priority) {
        throw new NotFoundException('Priority not found');
      }
    }

    // Check status

    if (dto.status_id !== undefined) {
      
      const status = await this.prisma.status.findUnique({
          where: {
            id: dto.status_id,
          },
        });

      if (!status) {
        throw new NotFoundException('Status not found');
      }
    }

    const updateData: any = {
      title: dto.title,
      description: dto.description,
      assign_to: dto.assign_to,
      priority_id: dto.priority_id,
      status_id: dto.status_id,
      comments: dto.comments,
    };

    if (dto.due_date) {
      updateData.due_date = new Date(dto.due_date);
    }

    Object.keys(updateData).forEach(
      (key) => {
        if(updateData[key] === undefined) {
          delete updateData[key];
        }
      },
    );

    const updatedTask = await this.prisma.tasks.update({
        where: {
          id,
        },

        data: updateData,
      });

    this.logger.log(`Updated task id=${id} successfully`);

    return {
      message: 'Task updated successfully',
      task: updatedTask,
    };
  }
  catch(error){
    if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }

    this.logger.error( `Failed to update task id=${id}: ${(error as Error).message}`, (error as Error).stack);
    throw new InternalServerErrorException('Failed to update task');
  }
  }

  // UPDATE STATUS

  async updateStatus( id: number, dto: UpdateTaskStatusDto,) {

    try{
   
    const task = await this.prisma.tasks.findUnique({
        where: {
          id,
        },
      });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const status = await this.prisma.status.findUnique({
        where: {
          id: dto.status_id,
        },
      });

    if (!status) {
      throw new NotFoundException('Status not found');
    }

    const updatedTask = await this.prisma.tasks.update({
        where: {
          id,
        },

        data: {
          status_id: dto.status_id,
        },
      });

    this.logger.log(`Updated task id=${id} status successfully`);

    return {
      message:
        'Task status updated successfully',

      task: updatedTask,
    };
  }

  catch(error){
    if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }

    this.logger.error( `Failed to update task status id=${id}: ${(error as Error).message}`, (error as Error).stack);
    throw new InternalServerErrorException('Failed to update task status');    
  }
  }

  // DEACTIVATE TASK

  async remove(id: number) {
    try{
    const task = await this.prisma.tasks.findUnique({
        where: {
          id,
        },
      });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.tasks.update({
      where: {
        id,
      },

      data: {
        is_active: 0,
      },
    });

    this.logger.log(`Deactivated task id=${id} successfully`);

    return {
      message: 'Task deactivated successfully',
    };
  }
  catch(error){
    if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }

    this.logger.error( `Failed to remove task id=${id}: ${(error as Error).message}`, (error as Error).stack);
    throw new InternalServerErrorException('Failed to remove task');    
  }
  }

  // GET ACTIVE PRIORITIES

  async getPriorities() {
    try{

    this.logger.log('Fetched priorities data successfully');
    
    return this.prisma.priority.findMany({
      where: {
        is_active: 1,
      },

      orderBy: {
        id: 'asc',
      },
    });
  }
  catch(error){
     if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }

    this.logger.error( 'Failed to fetch priorities', error instanceof Error ? error.stack : String(error) );
    throw new InternalServerErrorException('Failed to fetch priorities');
  }
  }

  // GET ACTIVE STATUSES

  async getStatuses() {
    try{

    this.logger.log('Fetched statuses data successfully');
  
    return this.prisma.status.findMany({
      where: {
        is_active: 1,
      },

      orderBy: {
        id: 'asc',
      },
    });
  }
  catch(error){
     if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }

    this.logger.error( 'Failed to fetch statuses', error instanceof Error ? error.stack : String(error) );
    throw new InternalServerErrorException('Failed to fetch statuses');
  }
  }
}