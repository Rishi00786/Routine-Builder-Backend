import { Module } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { DatabaseService } from 'src/database/database.service';
import { RoutinesController } from './routines.controller';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  providers: [RoutinesService, DatabaseService, JwtService, NotificationService],
  controllers: [RoutinesController],
})
export class RoutinesModule {}
