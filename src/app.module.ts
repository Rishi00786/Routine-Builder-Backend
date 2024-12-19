import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoutinesController } from './routines/routines.controller';
import { RoutinesService } from './routines/routines.service';
import { RoutinesModule } from './routines/routines.module';
import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [RoutinesModule, DatabaseModule],
  controllers: [AppController, RoutinesController],
  providers: [AppService, RoutinesService, DatabaseService],
})
export class AppModule {}
