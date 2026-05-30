import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '../../../../roles/roles.enum';

const idType = String;

export class User {
  @ApiProperty({
    type: idType,
  })
  id: string;

  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
  })
  email: string;

  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty({
    type: String,
    example: 'email',
  })
  @Expose({ groups: ['me', 'admin'] })
  provider: string;

  @ApiProperty({
    type: String,
    example: 'John',
  })
  first_name: string;

  @ApiProperty({
    type: String,
    example: 'Doe',
  })
  last_name: string;

  @ApiProperty({
    type: String,
  })
  photo?: string;

  @ApiProperty({
    enum: RoleEnum,
  })
  role: RoleEnum;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at?: Date;

  @ApiProperty()
  deleted_at?: Date;
}
