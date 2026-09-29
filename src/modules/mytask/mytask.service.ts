import {Injectable, NotFoundException, Logger, InternalServerErrorException, ConflictException} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateMyTaskDto } from './dto/update-my-task.dto.js';

@Injectable()
export class MyTaskService {
  
  private readonly logger = new Logger(MyTaskService.name);

  constructor( private readonly prisma: PrismaService, ) {}


  async getMyTasks(userId: number) {
    try{
    const tasks = await this.prisma.tasks.findMany({
        where: {
          assign_to: userId,
          is_active: 1,
        },

        orderBy: {
          due_date: 'asc',
        },
      });

    const tasksWithDetails = await Promise.all(
        tasks.map(async (task) => {

          const priority = await this.prisma.priority.findUnique({
              where: {
                id: task.priority_id,
              },

              select: {
                id: true,
                priority_name: true,
              },
            });

          const status = await this.prisma.status.findUnique({
              where: {
                id: task.status_id,
              },

              select: {
                id: true,
                status_name: true,
              },
            });

          const employee = await this.prisma.users.findUnique({
              where: {
                id: task.assign_to,
              },

              select: {
                id: true,
                full_name: true,
              },
            });

          return {
            ...task,
            priority,
            status,
            assigned_employee: employee,
          };
        }),
      );

    this.logger.log('Fetched Mytasks successfully');
    return tasksWithDetails;
    }

    catch(error){
       if (error instanceof ConflictException || error instanceof NotFoundException) {
          throw error;
        }
  
      this.logger.error( 'Failed to fetch MyTask ', error instanceof Error ? error.stack : String(error) );
      throw new InternalServerErrorException('Failed to fetch MyTask');
    }
  }


  async updateMyTask( taskId: number, userId: number, dto: UpdateMyTaskDto) {
    try{

    const task = await this.prisma.tasks.findFirst({
        where: {
          id: taskId,
          assign_to: userId,
          is_active: 1,
        },
      });

    if (!task) {
      throw new NotFoundException('Task not found or you are not assigned to this task');
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
          id: taskId,
        },

        data: {
          status_id: dto.status_id,
          ...(dto.comments !== undefined && {comments: dto.comments}),
        },
      });

    const priority = await this.prisma.priority.findUnique({
        where: {
          id: updatedTask.priority_id,
        },

        select: {
          id: true,
          priority_name: true,
        },
      });

    const updatedStatus = await this.prisma.status.findUnique({
        where: {
          id: updatedTask.status_id,
        },

        select: {
          id: true,
          status_name: true,
        },
      });

    const employee = await this.prisma.users.findUnique({
        where: {
          id: updatedTask.assign_to,
        },

        select: {
          id: true,
          full_name: true,
        },
      });

    this.logger.log(`Updated MyTask id=${taskId} successfully`);

    return {
      message: 'Task updated successfully',

      task: {
        ...updatedTask,
        priority,
        status: updatedStatus,
        assigned_employee: employee,
      },
    };
  }
  catch(error){
    if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }

    this.logger.error( `Failed to update MyTask id=${taskId}: ${(error as Error).message}`, (error as Error).stack);
    throw new InternalServerErrorException('Failed to update MyTask');
  }
  }

  
  async getStatuses() {
    try{
 
    this.logger.log('Fetched statuses successfully');

    return this.prisma.status.findMany({
    where: {
      is_active: 1,
    },
    select: {
      id: true,
      status_name: true,
    },
    orderBy: {
      id: "asc",
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

