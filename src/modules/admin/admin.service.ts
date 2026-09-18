import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [totalEmployees, totalDepartments, totalTasks, activeEmployees] = await Promise.all([
      
        // Total employees
      this.prisma.users.count({ }),

      // Total departments
      this.prisma.department.count({
        where: {
          is_active: 1,
        },
      }),

      // Total active tasks
      this.prisma.tasks.count({
        where: {
          is_active: 1,
        },
      }),

      // Active employees
      this.prisma.users.count({
        where: {
          is_active: 1,
        },
      }),
      
    ]);

    // Task status
    const statuses = await this.prisma.status.findMany({
      where: {
        is_active: 1,
      },
      select: {
        id: true,
        status_name: true,
      },
    });

    // Task count for each status
    const taskStatistics = await Promise.all(
      statuses.map(async (status) => {
        const count = await this.prisma.tasks.count({
          where: {
            status_id: status.id,
            is_active: 1,
          },
        });

        return {
          statusId: status.id,
          status: status.status_name,
          count,
        };
      }),
    );

    // Pending tasks
    const pendingStatus = statuses.find(
      (status) =>
        status.status_name.toLowerCase() === 'pending',
    );

    const pendingTasks = pendingStatus
      ? await this.prisma.tasks.count({
          where: {
            status_id: pendingStatus.id,
            is_active: 1,
          },
        })
      : 0;

    // Completed tasks
    const completedStatus = statuses.find(
      (status) =>
        status.status_name.toLowerCase() === 'completed',
    );

    const completedTasks = completedStatus
      ? await this.prisma.tasks.count({
          where: {
            status_id: completedStatus.id,
            is_active: 1,
          },
        })
      : 0;

      // Recently created employees

      const recentEmployees =
      await this.prisma.users.findMany({
        where: {
          is_active: 1,
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 5,
        select: {
          id: true,
          full_name: true,
          email: true,
          designation: true,
          dept_id: true,
          created_at: true,
        },
      });

    // Get department IDs used by recent employees
    const departmentIds = [...new Set(recentEmployees.map((employee) => employee.dept_id,),
      )];

    // Get department names
    const departments =
      await this.prisma.department.findMany({
        where: {
          id: {
            in: departmentIds,
          },
        },
        select: {
          id: true,
          dept_name: true,
        },
      });

    // Add department name to each employee
    const recentEmployeesWithDepartment =
      recentEmployees.map((employee) => {
        const employeeDepartment = departments.find((department) =>
            department.id === employee.dept_id,
        );

        return {
          id: employee.id,
          fullName: employee.full_name,
          email: employee.email,
          designation: employee.designation,
          department:
            employeeDepartment?.dept_name ?? 'N/A',
          createdAt: employee.created_at,
        };
      });

    return {
      totalEmployees,
      totalDepartments,
      totalTasks,
      activeEmployees,
      pendingTasks,
      completedTasks,
      recentEmployees: recentEmployeesWithDepartment,
      taskStatistics,
    };
  }
}