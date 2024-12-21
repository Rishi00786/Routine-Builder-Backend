import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateRoutineDTO } from './DTO/createRoutineDTO';
import { plainToClass } from 'class-transformer';

@Injectable()
export class RoutinesService {
  constructor(private readonly databaseServices: DatabaseService) {}

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

  async getAllRoutines() {
    return await this.databaseServices.routines.findMany();
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
}
