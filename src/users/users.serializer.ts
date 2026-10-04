import { User } from './entities/user.entity';

export interface UserResponse {
  id: number;
  username: string;
}

export function serializeUser(user: User): UserResponse {
  return { id: user.id, username: user.username };
}
