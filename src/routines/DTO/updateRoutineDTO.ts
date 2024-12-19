import { PartialType } from '@nestjs/mapped-types';
import { CreateRoutineDTO } from './createRoutineDTO';

export class UpdateUseDTO extends PartialType(CreateRoutineDTO) {}
