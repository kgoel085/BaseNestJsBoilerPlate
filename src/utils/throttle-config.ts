import { ThrottlerModuleOptions } from '@nestjs/throttler';

export enum ThrottleType {
  Short = 'short',
  Medium = 'medium',
  Long = 'long',
}

const throttleOptions: ThrottlerModuleOptions = [
  {
    name: ThrottleType.Short,
    ttl: 1000,
    limit: 20,
  },
  {
    name: ThrottleType.Medium,
    ttl: 10000,
    limit: 30,
  },
  {
    name: ThrottleType.Long,
    ttl: 60000,
    limit: 100,
  },
];
export default throttleOptions;
