import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  // private logger = new Logger(CacheService.name);
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async incr(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  async setWithMsTTL<T>(key: string, value: T, ttlMs: number) {
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);

    const result = await this.redis.set(key, stringValue, 'PX', ttlMs, 'NX');
    return result === 'OK';
  }

  async set<T>(key: string, value: T, ttlSeconds?: number) {
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);

    if (ttlSeconds) {
      await this.redis.set(key, stringValue, 'EX', ttlSeconds);
      // this.logger.log(
      //   `Set key in cache with TTL: ${key} (TTL: ${ttlSeconds}s)`,
      // );
    } else {
      await this.redis.set(key, stringValue);
      // this.logger.log(`Set key in cache: ${key}`);
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.redis.get(key);
    // this.logger.log(`Retrieved key from cache: ${key}`);

    if (!value) {
      // this.logger.log(`Key not found in cache: ${key}`);
      return undefined;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async del(key: string) {
    await this.redis.del(key);
    // this.logger.log(`Deleted key from cache: ${key}`);
  }

  async hset<T>(hash: string, key: string, value: T) {
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    await this.redis.hset(hash, key, stringValue);
  }

  async acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.redis.set(key, '1', 'EX', ttlSeconds, 'NX');

    if (result === 'OK') {
      // this.logger.log(`Acquired lock: ${key}`);
      return true;
    }

    // this.logger.log(`Failed to acquire lock (already exists): ${key}`);
    return false;
  }

  async hget<T>(hash: string, key: string): Promise<T | undefined> {
    const value = await this.redis.hget(hash, key);

    if (!value) {
      return undefined;
    }

    try {
      return (typeof value === 'string' ? JSON.parse(value) : value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async hdel(hash: string, key: string) {
    await this.redis.hdel(hash, key);
    // this.logger.log(`Deleted hash key from cache: ${hash} -> ${key}`);
  }

  async sadd(key: string, value: string) {
    await this.redis.sadd(key, value);
    // this.logger.log(`Added value to set in cache: ${key} -> ${value}`);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    if (!members.length) return 0;
    return this.redis.srem(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    const members = await this.redis.smembers(key);
    // this.logger.log(`Retrieved members of set from cache: ${key}`);
    return members;
  }

  async pexpire(key: string, ttlMs: number): Promise<void> {
    await this.redis.pexpire(key, ttlMs);
  }

  async spop(key: string, count?: number): Promise<string[]> {
    if (count) {
      const result = await this.redis.spop(key, count);

      if (!result) {
        return [];
      }

      return Array.isArray(result) ? result : [result];
    }

    const result = await this.redis.spop(key);

    return result ? [result] : [];
  }

  async scard(key: string): Promise<number> {
    return this.redis.scard(key);
  }
}
