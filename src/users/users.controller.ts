import { BadRequestException, Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { serializeUser, UserResponse } from './users.serializer';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(
    @Body('username') username?: string,
    @Body('password') password?: string,
  ): Promise<UserResponse> {
    if (!username?.trim() || !password) throw new BadRequestException();
    const user = await this.usersService.register(username.trim(), password);
    return serializeUser(user);
  }

  @Post('login')
  @HttpCode(200)
  login(): void {}

  @Post('logout')
  @HttpCode(200)
  logout(): void {}
}
