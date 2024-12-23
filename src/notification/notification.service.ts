import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  async sendNotification(userId: string, message: string) {
    console.log(`Sending notification to user ${userId}: ${message}`);
  }
}
