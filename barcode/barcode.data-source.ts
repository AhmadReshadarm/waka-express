import { DataSource } from 'typeorm';
import { Barcodes } from '../core/entities';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST ?? 'localhost',
  port: 3306,
  username: 'root',
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  logging: true,
  synchronize: true,
  migrationsRun: false,
  entities: [Barcodes],
  charset: 'utf8mb4',
});

export default dataSource;
