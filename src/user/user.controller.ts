import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserDTO } from './DTO/createUserDTO';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() createUserDTO: CreateUserDTO) {
    try {
      const user = await this.userService.createUser(createUserDTO);
      return { message: 'User created successfully', user };
    } catch (error) {
      return { message: 'Error creating user', error };
    }
  }

  @Get()
  async findAll() {
    return await this.userService.findAll();
  }
}
