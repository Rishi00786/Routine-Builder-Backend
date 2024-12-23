import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RoutinesService } from 'src/routines/routines.service';

@Injectable()
export class MilestoneNotificationScheduler {
  constructor(private readonly routinesService: RoutinesService) {}

  @Cron('0 0 * * *')
  async handleMilestoneNotifications() {
    console.log('Checking and sending routine milestone notifications...');
    await this.routinesService.checkAndNotifyMilestones();
  }
}
