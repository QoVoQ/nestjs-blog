module.exports = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'admin',
  password: 'admin',
  database: 'blog',
  synchronize: true,
  entities: ['src/**/*.entity{.ts,.js}'],
};
