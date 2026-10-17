import {
  CanActivate, createParamDecorator, ExecutionContext, Injectable, SetMetadata, UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SESSION_COOKIE, SessionService, SessionUser } from '../session/session.service';

const AUTH_REQUIRED = 'authRequired';

export const AuthRequired = () => SetMetadata(AUTH_REQUIRED, true);

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): SessionUser | null => ctx.switchToHttp().getRequest().user ?? null,
);

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly sessions: SessionService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const sessionId: string | undefined = req.cookies?.[SESSION_COOKIE];
    req.user = sessionId ? await this.sessions.get(sessionId) : null;

    const required = this.reflector.getAllAndOverride<boolean>(AUTH_REQUIRED, [ctx.getHandler(), ctx.getClass()]);
    if (required && !req.user) throw new UnauthorizedException();
    return true;
  }
}
