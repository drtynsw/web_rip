import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes, scryptSync } from 'crypto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  static hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
  }

  async register(username: string, password: string): Promise<User> {
    const exists = await this.userRepository.findOne({ where: { username } });
    if (exists) throw new ConflictException(); // логин занят -> 409

    const user = this.userRepository.create({
      username,
      password: UsersService.hashPassword(password),
    });
    return this.userRepository.save(user);
  }
}
