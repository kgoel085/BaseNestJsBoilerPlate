import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/repositories/user/domain/user';

export class LoginResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  tokenExpires: number;

  @ApiProperty({
    type: () => User,
  })
  user: User;
}
