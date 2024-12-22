import { PartialType } from '@nestjs/mapped-types';
import { CreateRoutineDTO } from './createRoutineDTO';

export class UpdateRoutineDTO extends PartialType(CreateRoutineDTO) {}
