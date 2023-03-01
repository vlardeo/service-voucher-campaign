import type { Pool } from 'pg';

export default async (pool: Pool) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const queryTextDeleteVouchers = 'DELETE FROM vouchers';
    const queryTextDeleteCampaigns = 'DELETE FROM campaigns';

    await client.query(queryTextDeleteVouchers);
    await client.query(queryTextDeleteCampaigns);

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};
