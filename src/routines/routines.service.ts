import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateRoutineDTO } from './DTO/createRoutineDTO';
import { plainToClass } from 'class-transformer';
import { UpdateRoutineDTO } from './DTO/updateRoutineDTO';
import * as moment from 'moment';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class RoutinesService {
  constructor(
    private readonly databaseServices: DatabaseService,
    private readonly notificationService: NotificationService,
  ) {}

  async createRoutine(routine: CreateRoutineDTO) {
    const plainRoutine = plainToClass(CreateRoutineDTO, routine);

    const plainSteps = plainRoutine.steps.map((step) => ({
      description: step.description,
      product: {
        'product-name': step.product['product-name'],
        'product-desc': step.product['product-desc'],
      },
    }));

    return await this.databaseServices.routines.create({
      data: {
        name: plainRoutine.name,
        description: plainRoutine.description,
        duration: plainRoutine.duration,
        milestones: plainRoutine.milestones,
        imagePreview: plainRoutine.imagePreview,
        steps: plainSteps,
        benefits: plainRoutine.benefits,
        preBuilt: plainRoutine.preBuilt ?? false,
      },
    });
  }

  async getRoutineById(id: string) {
    return await this.databaseServices.routines.findUnique({ where: { id } });
  }

  async assignRoutineToUser(userId: string, routineId: string) {
    const routine = await this.databaseServices.routines.findUnique({
      where: { id: routineId },
    });

    if (!routine) {
      throw new NotFoundException('Routine not found');
    }

    await this.databaseServices.routinesOnUsers.upsert({
      where: { userId_routineId: { userId, routineId } },
      update: { assignedAt: new Date() },
      create: { userId, routineId, assignedAt: new Date() },
    });

    return { message: 'Routine successfully assigned to user' };
  }

  async getUserRoutines(userId: string) {
    const routines = await this.databaseServices.routines.findMany({
      where: {
        users: {
          some: { userId },
        },
      },
      include: {
        users: {
          where: { userId },
          select: {
            progress: true,
            completed: true,
          },
        },
      },
    });

    // console.log(routines);

    // Map routines to include progress and completed fields
    return (
      routines.map((routine) => {
        const userRoutine = routine.users[0]; // There will only be one entry because userId is unique per routine

        return {
          ...routine,
          progress: userRoutine?.progress || 0, // Default to 0 if no progress exists
          completed: userRoutine?.completed || false, // Default to false if not completed
        };
      }) || []
    );
  }

  async getCompletedTasks(userId: string, routineId: string) {
    const routineOnUser =
      await this.databaseServices.routinesOnUsers.findUnique({
        where: { userId_routineId: { userId, routineId } },
        select: { completedTasks: true, completed: true, progress: true },
      });

    if (!routineOnUser) {
      throw new NotFoundException('Routine not assigned to this user');
    }

    const routine = await this.databaseServices.routines.findUnique({
      where: { id: routineId },
    });

    // console.log('Completed tasks found:', routineOnUser);

    if (routineOnUser.completedTasks === null) {
      routineOnUser.completedTasks = new Array(parseInt(routine.duration)).fill(
        false,
      );
    }

    return {
      completedTasks: routineOnUser.completedTasks || [],
      completed: routineOnUser.completed,
      progress: routineOnUser.progress,
    };
  }

  // Update completed tasks for a user's routine
  async updateCompletedTasks(
    userId: string,
    routineId: string,
    completedTasks: boolean[],
  ) {
    const routine = await this.databaseServices.routines.findUnique({
      where: { id: routineId },
    });

    if (!routine) {
      throw new NotFoundException('Routine not found');
    }

    // Calculate progress based on completed tasks
    const totalTasks = completedTasks.length;
    const completedWeeks = completedTasks.filter((task) => task).length;
    const progress = Math.round((completedWeeks / totalTasks) * 100);

    // console.log(progress);
    if (progress === 100) {
      try {
        const routineOnUser =
          await this.databaseServices.routinesOnUsers.findUnique({
            where: {
              userId_routineId: { userId, routineId },
            },
          });

        if (routineOnUser) {
          // Set completed flag to true if routine is fully completed
          await this.databaseServices.routinesOnUsers.update({
            where: {
              userId_routineId: { userId, routineId },
            },
            data: {
              completed: true,
            },
          });
        }
      } catch (error) {
        console.error('Error updating routine completion:', error);
        throw new Error('Failed to update routine completion');
      }
    }

    const completed = completedWeeks === totalTasks;

    const routineOnUser = await this.databaseServices.routinesOnUsers.upsert({
      where: { userId_routineId: { userId, routineId } },
      update: {
        completedTasks,
        progress,
        completed,
      },
      create: {
        userId,
        routineId,
        completedTasks,
        progress,
        completed,
      },
    });

    // console.log(routineOnUser);
    return routineOnUser;
  }

  async getEngagementInsights() {
    const totalCompletions = await this.databaseServices.routinesOnUsers.count({
      where: { completed: true },
    });

    // console.log(totalCompletions);

    const popularRoutines = await this.databaseServices.routinesOnUsers.groupBy(
      {
        by: ['routineId'],
        _count: { routineId: true },
        orderBy: { _count: { routineId: 'desc' } },
      },
    );

    const popularRoutinesWithNames = await Promise.all(
      popularRoutines.map(async (routine) => {
        const routineData = await this.databaseServices.routines.findUnique({
          where: { id: routine.routineId },
          select: { name: true },
        });
        return {
          routineName: routineData?.name,
          count: routine._count.routineId,
        };
      }),
    );

    // Progress with user and routine names
    const progress = await this.databaseServices.routinesOnUsers.findMany({
      select: {
        user: {
          select: { username: true },
        },
        routine: {
          select: { name: true },
        },
        progress: true,
        completedTasks: true,
      },
    });

    const progressWithDetails = progress.map((entry) => ({
      username: entry.user.username,
      routineName: entry.routine.name,
      progress: entry.progress,
      completedTasks: entry.completedTasks,
    }));

    return {
      totalCompletions,
      popularRoutines: popularRoutinesWithNames,
      progress: progressWithDetails,
    };
  }
  async updateRoutine(id: string, updateRoutineDto: UpdateRoutineDTO) {
    // Find the existing routine
    const existingRoutine = await this.databaseServices.routines.findUnique({
      where: { id },
    });

    if (!existingRoutine) {
      throw new NotFoundException(`Routine with ID ${id} not found`);
    }

    // Transform steps into JSON-compatible objects, if provided
    const updateData = {
      ...updateRoutineDto,
      steps: updateRoutineDto.steps
        ? updateRoutineDto.steps.map((step) => ({
            description: step.description,
            product: {
              'product-name': step.product['product-name'],
              'product-desc': step.product['product-desc'],
            },
          }))
        : undefined,
    };

    const updatedRoutine = await this.databaseServices.routines.update({
      where: { id },
      data: updateData,
    });
    return updatedRoutine;
  }

  async checkAndNotifyMilestones() {
    const userRoutines = await this.databaseServices.routinesOnUsers.findMany({
      include: {
        user: { select: { id: true, username: true } },
        routine: { select: { id: true, name: true } },
      },
    });

    const currentDate = new Date();

    for (const userRoutine of userRoutines) {
      const { user, routine, assignedAt } = userRoutine;
      const diffInDays = moment(currentDate).diff(moment(assignedAt), 'days');

      if (diffInDays === 3) {
        await this.sendRoutineMilestoneNotification(user, routine, '3 days');
      }

      if (diffInDays === 7) {
        await this.sendRoutineMilestoneNotification(user, routine, '1 week');
      }

      if (diffInDays === 14) {
        await this.sendRoutineMilestoneNotification(user, routine, '2 weeks');
      }
    }
  }

  private async sendRoutineMilestoneNotification(
    user: { id: string; username: string },
    routine: { id: string; name: string },
    milestone: string,
  ) {
    const message = `Hey ${user.username}, you've reached ${milestone} on your "${routine.name}" routine. Keep it up!`;

    try {
      await this.notificationService.sendNotification(user.id, message);
      console.log(
        `Notification sent to user ${user.username} for ${milestone} milestone.`,
      );
    } catch (error) {
      console.error(
        `Failed to send notification to user ${user.username}:`,
        error,
      );
    }
  }
}
