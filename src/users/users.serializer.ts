import { ApiProperty } from '@nestjs/swagger';
import { User } from './entities/user.entity';

export class UserResponse {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 'security_analyst' }) username: string;
}

export function serializeUser(user: { id: number; username: string }): UserResponse {
  return { id: user.id, username: user.username };
}
