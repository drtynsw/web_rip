import { BadRequestException, Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { serializeUser, UserResponse } from './users.serializer';
import { RegisterRequest } from './users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() body: RegisterRequest): Promise<UserResponse> {
    const username = body?.username?.trim();
    if (!username || !body?.password) throw new BadRequestException();
    const user = await this.usersService.register(username, body.password);
    return serializeUser(user);
  }

  @Post('login')
  @HttpCode(200)
  login(): void {}

  @Post('logout')
  @HttpCode(200)
  logout(): void {}
}
