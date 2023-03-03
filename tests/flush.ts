import type { Pool } from 'pg';

export default async (pool: Pool) => {
  await pool.query('DELETE FROM vouchers');
  await pool.query('DELETE FROM campaigns');
};
