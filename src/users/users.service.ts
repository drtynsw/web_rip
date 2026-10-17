import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { User } from './entities/user.entity';
import { SessionService, SessionUser } from '../session/session.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly sessions: SessionService,
  ) {}

  static hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
  }

  static checkPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const actual = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return expected.length === actual.length && timingSafeEqual(actual, expected);
  }

  async register(username: string, password: string): Promise<User> {
    const exists = await this.userRepository.findOne({ where: { username } });
    if (exists) throw new ConflictException(); // логин занят -> 409
    return this.userRepository.save(this.userRepository.create({ username, password: UsersService.hashPassword(password) }));
  }

  async login(username: string, password: string): Promise<{ sessionId: string; user: SessionUser }> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user || !UsersService.checkPassword(password, user.password)) throw new UnauthorizedException();
    const sessionUser: SessionUser = { id: user.id, username: user.username };
    const sessionId = await this.sessions.create(sessionUser);
    return { sessionId, user: sessionUser };
  }

  async logout(sessionId: string | undefined): Promise<void> {
    if (sessionId) await this.sessions.destroy(sessionId);
  }
}
