import {
  // decorators here
  Transform,
} from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  // decorators here
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MinLength,
} from 'class-validator';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';
import { RoleEnum } from '../../roles/roles.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John', type: String })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', type: String })
  @IsNotEmpty()
  lastName: string;
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  photo?: string;

  @ApiPropertyOptional({ enum: RoleEnum })
  @IsOptional()
  @IsEnum(RoleEnum)
  role: RoleEnum;
}
