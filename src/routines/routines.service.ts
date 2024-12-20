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
    console.log('User ID:', userId); // Log userId
    const routines = await this.databaseServices.routines.findMany({
      where: {
        users: {
          some: { userId },
        },
      },
    });

    console.log('Routines found:', routines); // Log routines found
    return routines || [];
  }
}
