import pool from '../src/drivers/postgresql';

afterAll(async () => {
  pool.end();
});
