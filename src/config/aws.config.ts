import { registerAs } from '@nestjs/config';
import validateConfig from '.././utils/validate-config';
import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { AwsConfig } from './aws-config.type';

class EnvironmentVariablesValidator {
  @IsNotEmpty()
  @IsString()
  AWS_REGION: string;

  @IsOptional()
  @IsString()
  AWS_DEV_ENDPOINT?: string;

  @ValidateIf((envValues) => envValues.AWS_DEV_ENDPOINT)
  @IsNotEmpty()
  @IsString()
  AWS_DEV_SECRET_KEY: string;

  @ValidateIf((envValues) => envValues.AWS_DEV_ENDPOINT)
  @IsNotEmpty()
  @IsString()
  AWS_DEV_ACCESS_KEY: string;

  @IsOptional()
  @IsString()
  AWS_ACCESS_KEY: string;

  @IsOptional()
  @IsString()
  AWS_SECRET_KEY: string;
}

export default registerAs<AwsConfig>('aws', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    region: process.env.AWS_REGION || '',
    accessKey: process.env.AWS_ACCESS_KEY || '',
    secretKey: process.env.AWS_SECRET_KEY || '',
    devEndpoint: process.env.AWS_DEV_ENDPOINT,
    devAccessKey: process.env.AWS_DEV_SECRET_KEY,
    devSecretKey: process.env.AWS_DEV_ACCESS_KEY,
  };
});
