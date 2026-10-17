import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequest {
  @ApiProperty({ example: 'new_researcher' })
  username: string;

  @ApiProperty({ example: 'secret123' })
  password: string;
}

export class LoginRequest {
  @ApiProperty({ example: 'security_analyst' })
  username: string;

  @ApiProperty({ example: 'analyst_pass_1' })
  password: string;
}
