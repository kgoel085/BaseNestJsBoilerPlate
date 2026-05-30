import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  // run
  // await app.get(RoleSeedService).run();

  await app.close();
};

void runSeed();
