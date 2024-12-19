import { Module } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { DatabaseService } from 'src/database/database.service';
import { RoutinesController } from './routines.controller';

@Module({
  providers: [RoutinesService, DatabaseService],
  controllers: [RoutinesController],
})
export class RoutinesModule {}
