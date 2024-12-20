import { Module } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { DatabaseService } from 'src/database/database.service';
import { RoutinesController } from './routines.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [RoutinesService, DatabaseService, JwtService],
  controllers: [RoutinesController],
})
export class RoutinesModule {}
