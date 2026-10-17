import { BadRequestException, Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { UsersService } from './users.service';
import { serializeUser, UserResponse } from './users.serializer';
import { LoginRequest, RegisterRequest } from './users.dto';
import { SESSION_COOKIE, SESSION_TTL_SEC } from '../session/session.service';

@ApiTags('Пользователь — users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: '8. Регистрация' })
  @ApiBody({ type: RegisterRequest })
  @ApiCreatedResponse({ type: UserResponse })
  @ApiResponse({ status: 400, description: 'Пустой логин или пароль' })
  @ApiResponse({ status: 409, description: 'Логин занят' })
  async register(@Body() body: RegisterRequest): Promise<UserResponse> {
    const username = body?.username?.trim();
    if (!username || !body?.password) throw new BadRequestException();
    return serializeUser(await this.usersService.register(username, body.password));
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: '9. Аутентификация', description: 'Создаёт сессию в Redis и ставит куку sessionId.' })
  @ApiBody({ type: LoginRequest })
  @ApiOkResponse({ type: UserResponse })
  @ApiResponse({ status: 401, description: 'Неверный логин или пароль' })
  async login(@Body() body: LoginRequest, @Res({ passthrough: true }) res: Response): Promise<UserResponse> {
    if (!body?.username || !body?.password) throw new BadRequestException();
    const { sessionId, user } = await this.usersService.login(body.username.trim(), body.password);
    res.cookie(SESSION_COOKIE, sessionId, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: SESSION_TTL_SEC * 1000 });
    return serializeUser(user);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiCookieAuth('sessionId')
  @ApiOperation({ summary: '10. Деавторизация', description: 'Удаляет сессию из Redis и куку sessionId.' })
  @ApiOkResponse({ description: 'Тело пустое' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.usersService.logout(req.cookies?.[SESSION_COOKIE]);
    res.clearCookie(SESSION_COOKIE);
  }
}
