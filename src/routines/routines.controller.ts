import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { CreateRoutineDTO } from './DTO/createRoutineDTO';
import { AuthGuard } from 'src/auth/auth.gaurd';

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

  @UseGuards(AuthGuard)
  @Post('assign')
  async assignRoutineToUser(@Req() req, @Body('routineId') routineId: string) {
    const userId = req.user.id;
    return this.routineService.assignRoutineToUser(userId, routineId);
  }

  // @UseGuards(AuthGuard)
  @Get('my')
  async getUserRoutines(@Req() req) {
    console.log('request', req);
    const userId = req.user.id;

    console.log(userId);

    if (!userId) {
      throw new Error('No user found');
    }

    const routines = await this.routineService.getUserRoutines(userId);

    return routines || [];
  }
}
