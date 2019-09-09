export const ormConfig = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'admin',
  password: 'admin',
  database: 'blog',
  synchronize: true,
  entities:
    process.env.NODE_ENV === 'production'
      ? ['dist/**/*.entity.js']
      : ['src/**/*.entity.ts'],
  migrations: ['migration/*.js'],
  migrationsTableName: 'migrations',
  cli: {
    migrationsDir: 'migration',
  },
};
