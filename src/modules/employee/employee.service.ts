import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class EmployeeService {
  constructor( private readonly prisma: PrismaService ) {}

  async getDashboard(userId: number) {
    const statuses = await this.prisma.status.findMany({
      where: {
        is_active: 1,
      },
      select: {
        id: true,
        status_name: true,
      },
    });

    const completedStatus = statuses.find((status) =>
        status.status_name.toLowerCase() === 'completed',
    );

    const myTasks = await this.prisma.tasks.count({
      where: {
        assign_to: userId,
        is_active: 1,
      },
    });

    const completedTasks = completedStatus
      ? await this.prisma.tasks.count({
          where: {
            assign_to: userId,
            status_id: completedStatus.id,
            is_active: 1,
          },
        })
      : 0;

    const announcements = await this.prisma.announcement.count({
      where: {
        is_active: 1,
        publish_date: {
          lte: new Date(),
        },
      },
    });

    const tasks = await this.prisma.tasks.findMany({
      where: {
        assign_to: userId,
        is_active: 1,
      },
      orderBy: [
        {
          due_date: 'asc',
        },
        {
          created_at: 'desc',
        },
      ],
      take: 5,
      select: {
        id: true,
        title: true,
        due_date: true,
        priority_id: true,
        status_id: true,
      },
    });

    const priorityIds = [...new Set(
        tasks.map((task) => task.priority_id),
      ),
    ];

    const priorities = await this.prisma.priority.findMany({
      where: {
        id: {
          in: priorityIds,
        },
      },
      select: {
        id: true,
        priority_name: true,
      },
    });

    const statusIds = [...new Set(
        tasks.map((task) => task.status_id),
      ),
    ];

    const taskStatuses = await this.prisma.status.findMany({
      where: {
        id: {
          in: statusIds,
        },
      },
      select: {
        id: true,
        status_name: true,
      },
    });

    const taskList = tasks.map((task) => {
      const priority = priorities.find(
        (item) => item.id === task.priority_id,
      );

      const status = taskStatuses.find(
        (item) => item.id === task.status_id,
      );

      return {
        id: task.id,
        title: task.title,
        priority: priority?.priority_name ?? 'N/A',
        dueDate: task.due_date,
        status: status?.status_name ?? 'N/A',
      };
    });

    return {
      myTasks,
      completedTasks,
      announcements,
      tasks: taskList,
    };
  }
}