import { registerAs } from '@nestjs/config';
import { AppConfig } from './app-config.type';
import validateConfig from '.././utils/validate-config';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { IsRedisUrl } from '../utils/decorators';
import { parseRedisUrl } from '../utils/common';
import path from 'path';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariablesValidator {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  APP_NAME?: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  APP_PORT: number;

  @IsUrl({ require_tld: false })
  @IsOptional()
  FRONTEND_DOMAIN: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  BACKEND_DOMAIN: string;

  @IsString()
  @IsOptional()
  API_PREFIX: string;

  @IsString()
  @IsOptional()
  APP_FALLBACK_LANGUAGE: string;

  @IsString()
  @IsOptional()
  APP_HEADER_LANGUAGE: string;

  @IsNotEmpty()
  @IsString()
  @IsRedisUrl()
  REDIS_HOST: string;

  @IsString()
  @IsNotEmpty()
  DATA_ENCRYPT_KEY: string;

  @IsOptional()
  @IsString()
  ALLOWED_ORIGINS: string;
}

export default registerAs<AppConfig>('app', () => {
  const env = validateConfig(process.env, EnvironmentVariablesValidator);
  const redisInfo = parseRedisUrl(env.REDIS_HOST);

  return {
    nodeEnv: env.NODE_ENV || 'development',
    name: env?.APP_NAME || 'app',
    workingDirectory: path.join(process.env.PWD || process.cwd(), 'dist'),
    frontendDomain: env.FRONTEND_DOMAIN,
    backendDomain: env.BACKEND_DOMAIN ?? 'http://localhost',
    port: process.env.APP_PORT
      ? parseInt(process.env.APP_PORT, 10)
      : process.env.PORT
        ? parseInt(process.env.PORT, 10)
        : 3000,
    apiPrefix: env.API_PREFIX || 'api',
    fallbackLanguage: env.APP_FALLBACK_LANGUAGE || 'en',
    allowedOrigins: process.env.ALLOWED_ORIGINS ?? undefined,
    headerLanguage: env.APP_HEADER_LANGUAGE || 'x-custom-lang',
    redisUrl: redisInfo.url,
    redisHost: redisInfo.host || 'localhost',
    redisPort: redisInfo.port.toString() || '6379',
    redisEnableEncryption: redisInfo.encryption || false,
    redisUserName: redisInfo.username,
    redisPassword: redisInfo.password,
    dataEncryptKey: env.DATA_ENCRYPT_KEY,
  };
});
