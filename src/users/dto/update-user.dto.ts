import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsUUID, MinLength } from 'class-validator';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: 'John', type: String })
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', type: String })
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  photo?: string;
}
