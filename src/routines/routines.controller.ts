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

  // @Get('my')
  // getUserRoutines() {
  //   return this.routineService.getUserRoutines();
  // }

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

  @UseGuards(AuthGuard)
  @Post('my')
  getUserRoutines(@Req() req) {
    // console.log('request', req);
    const userId = req.user.id;

    // console.log(userId);

    if (!userId) {
      throw new Error('No user found');
    }
    const routines = this.routineService.getUserRoutines(userId);
    return routines || [];
  }

  @UseGuards(AuthGuard)
  @Get(':routineId/tasks')
  getCompletedTasks(@Req() req, @Param('routineId') routineId: string) {
    const userId = req.user.id;
    return this.routineService.getCompletedTasks(userId, routineId);
  }

  @UseGuards(AuthGuard)
  @Post(':routineId/tasks')
  updateCompletedTasks(
    @Req() req,
    @Param('routineId') routineId: string,
    @Body('completedTasks') completedTasks: boolean[],
  ) {
    const userId = req.user.id;
    return this.routineService.updateCompletedTasks(
      userId,
      routineId,
      completedTasks,
    );
  }

  @Post('engagement')
  async getEngagementInsights() {
    // return 'hello';
    return this.routineService.getEngagementInsights();
  }
}
