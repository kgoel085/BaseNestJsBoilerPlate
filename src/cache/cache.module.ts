import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import Redis from 'ioredis';
import { AllConfigType } from '../config/config.type';

@Module({
  imports: [ConfigModule],
  providers: [
    CacheService,
    Logger,
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService<AllConfigType>) => {
        const redisUrl = configService.getOrThrow('app.redisUrl', {
          infer: true,
        });
        return new Redis(redisUrl);
      },
      inject: [ConfigService],
    },
  ],
  exports: [CacheService],
})
export class InCacheModule {}
