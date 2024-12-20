import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoutinesController } from './routines/routines.controller';
import { RoutinesService } from './routines/routines.service';
import { RoutinesModule } from './routines/routines.module';
import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [RoutinesModule, DatabaseModule, UserModule, AuthModule],
  controllers: [
    AppController,
    RoutinesController,
    UserController,
    AuthController,
  ],
  providers: [
    AppService,
    RoutinesService,
    DatabaseService,
    UserService,
    AuthService,
  ],
})
export class AppModule {}
