import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const ormConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 23106,
  username: 'admin',
  password: 'admin',
  database: 'blog',
  synchronize: true,
  dropSchema: true,
  entities: ['src/**/*.entity{.ts,.js}', 'dist/**/*.entity{.ts,.js}'],
  migrations: ['migration/*.js'],
  migrationsTableName: 'migrations',
  cli: {
    migrationsDir: 'migration',
  },
};
