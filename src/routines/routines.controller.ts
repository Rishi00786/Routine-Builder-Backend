import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { CreateRoutineDTO } from './DTO/createRoutineDTO';

@Controller('routines')
export class RoutinesController {
  constructor(private readonly routineService: RoutinesService) {}

  @Post()
  createRoutine(@Body() createRoutineDto: CreateRoutineDTO) {
    return this.routineService.createRoutine(createRoutineDto);
  }

  @Get()
  getAllRoutines() {
    return this.routineService.getAllRoutines();
  }

  @Get(':id')
  getRoutineById(@Param('id') id: string) {
    return this.routineService.getRoutineById(id);
  }
}
