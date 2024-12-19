import { Injectable } from '@nestjs/common';
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
}
