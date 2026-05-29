import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';

const isTs = path.extname(__filename) === '.ts';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT || 5432),
  username: process.env.DATABASE_USER || 'app_user',
  password: process.env.DATABASE_PASS || 'app_pass',
  database: process.env.DATABASE_NAME || 'servicentro_db',
  entities: [isTs ? 'src/**/*.entidad.ts' : 'dist/**/*.entidad.js'],
  migrations: [
    isTs ? 'src/database/migrations/*.ts' : 'dist/database/migrations/*.js',
  ],
  synchronize: false,
  logging:
    process.env.TYPEORM_LOGGING === 'true' ||
    process.env.NODE_ENV !== 'production',
});
