import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDTO } from './DTO/createUserDTO';
import { hash, compare } from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly databaseSevervices: DatabaseService) {}

  async createUser(createUserDTO: CreateUserDTO): Promise<User> {
    try {
      const user = await this.databaseSevervices.user.findUnique({
        where: { username: createUserDTO.username },
      });

      if (user) {
        throw new HttpException(
          'User with this username already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      const hashedPassword = await hash(createUserDTO.password, 10);

      return this.databaseSevervices.user.create({
        data: {
          username: createUserDTO.username,
          password: hashedPassword,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Error creating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async findAll() {
    return this.databaseSevervices.user.findMany();
  }

  async findOne(username: string): Promise<User | null> {
    return this.databaseSevervices.user.findUnique({
      where: {
        username: username,
      },
    });
  }

  async validateUser(username: string, password: string): Promise<User> {
    try {
      const user = await this.databaseSevervices.user.findUnique({
        where: { username },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }

      const isPasswordValid = await compare(password, user.password);

      if (!isPasswordValid) {
        throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
      }

      return user;
    } catch (error) {
      throw new HttpException(
        'Error validating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }
}
