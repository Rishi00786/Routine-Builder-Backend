import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserDTO } from './DTO/createUserDTO';
import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  async signup(@Body() createUserDTO: CreateUserDTO) {
    try {
      const user = await this.userService.createUser(createUserDTO);

      const isValid = await this.authService.signIn(
        createUserDTO.username,
        createUserDTO.password,
      );

      if (!isValid) {
        return { message: 'Invalid credentials' };
      }

      return {
        message: 'User created successfully',
        user,
        access_token: isValid.access_token,
      };
    } catch (error) {
      return { message: 'Error creating user', error };
    }
  }

  @Get()
  async findAll() {
    return await this.userService.findAll();
  }
}
