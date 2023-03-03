import pool from '@/drivers/postgresql';

afterAll(async () => {
  pool.end();
});
