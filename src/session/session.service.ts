import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';

export interface SessionUser {
  id: number;
  username: string;
}

export const SESSION_COOKIE = 'sessionId';
export const SESSION_TTL_SEC = 24 * 60 * 60; // сутки

@Injectable()
export class SessionService implements OnModuleDestroy {
  private readonly logger = new Logger(SessionService.name);
  private readonly redis: Redis;

  constructor(config: ConfigService) {
    this.redis = new Redis({
      host: config.get<string>('REDIS_HOST', 'localhost'),
      port: Number(config.get<string>('REDIS_PORT', '6379')),
      password: config.get<string>('REDIS_PASSWORD') || undefined,
    });
    this.redis.on('error', (err) => this.logger.error(`Redis: ${err.message}`));
  }

  async create(user: SessionUser): Promise<string> {
    const sessionId = randomUUID();
    await this.redis.set(`session:${sessionId}`, JSON.stringify(user), 'EX', SESSION_TTL_SEC);
    return sessionId;
  }

  async get(sessionId: string): Promise<SessionUser | null> {
    const value = await this.redis.get(`session:${sessionId}`);
    return value ? (JSON.parse(value) as SessionUser) : null;
  }

  async destroy(sessionId: string): Promise<void> {
    await this.redis.del(`session:${sessionId}`);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
