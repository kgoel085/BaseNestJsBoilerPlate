import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import 'reflect-metadata';
import {
  DataSource,
  DataSourceOptions,
  EntityManager,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import databaseConfig from './config/database.config';
import { DatabaseConfig } from './config/database-config.type';
import { Environment } from '../config/config.type';
import { ENTITY_MANAGER_KEY } from '../utils/interceptors/db-transaction.interceptor';

const db = databaseConfig() as DatabaseConfig;
const nodeEnv = (process.env.NODE_ENV ||
  Environment.Development) as Environment;

export const AppDataSource = new DataSource({
  type: db.type || 'postgres',
  url: db.url,
  host: db.host,
  port: db.port ?? 5432,
  username: db.username,
  password: db.password,
  database: db.name,
  synchronize: db.synchronize,
  dropSchema: false,
  keepConnectionAlive: true,
  logging: [Environment.Local, Environment.Development].includes(nodeEnv)
    ? ['error', 'warn', 'info']
    : ['error'],
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  cli: {
    entitiesDir: 'src',

    subscribersDir: 'subscriber',
  },
  extra: {
    // based on https://node-postgres.com/api/pool
    // max connection pool size
    max: db.maxConnections ?? 100,
    ssl: db.sslEnabled
      ? {
          rejectUnauthorized: db.rejectUnauthorized,
          ca: db.ca ?? undefined,
          key: db.key ?? undefined,
          cert: db.cert ?? undefined,
        }
      : undefined,
  },
} as DataSourceOptions);

@Injectable()
export class BaseRepository {
  constructor(
    private dataSource: DataSource,
    private readonly cls: ClsService,
  ) {}

  protected getRepository<T extends ObjectLiteral>(
    entityCls: new () => T,
  ): Repository<T> {
    let entityManager = this.dataSource.manager;

    const clsEntityManager = this.cls.get<EntityManager>(ENTITY_MANAGER_KEY);
    if (clsEntityManager) {
      entityManager = clsEntityManager;
    }

    return entityManager.getRepository(entityCls);
  }
}
