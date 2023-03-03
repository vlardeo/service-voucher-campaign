import { Pool } from 'pg';
import env from '@env';

const pool = new Pool({
  host: env.POSTGRESQL_HOST,
  port: env.POSTGRESQL_PORT,
  database: env.POSTGRESQL_DATABASE,
  user: env.POSTGRESQL_USER,
  password: env.POSTGRESQL_PASSWORD,
});

export default pool;
