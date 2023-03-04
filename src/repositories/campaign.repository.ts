import pool from '@/drivers/postgresql';
import type { Campaign, CreateCampaignDto } from '@/interfaces/domain/campaign.types';
import type { Page, SqlCount } from '@/common/types';
import type { ListCampaignsQuery, SqlCampaignRepositoryPort } from '@/interfaces/repositories/campaign-repository.port';
import { objectKeysToCamelCase } from '@/utils/case-convert';

const pgCampaignRepository: SqlCampaignRepositoryPort = {
  create: async (input: CreateCampaignDto): Promise<Campaign> => {
    const queryText = `
      INSERT INTO campaigns (
        prefix,
        from_date,
        to_date,
        amount,
        currency
      ) VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    // Assure that pass values in the query in correct order
    const { prefix, fromDate, toDate, amount, currency } = input;
    const queryValues = [prefix, fromDate, toDate, amount, currency];

    const response = await pool.query<Campaign>(queryText, queryValues);

    return objectKeysToCamelCase(response.rows[0]) as Campaign;
  },

  async findById(id: string): Promise<Campaign | null> {
    const queryText = `
      SELECT
        *
      FROM
        campaigns
      WHERE
        id = $1
    `;
    const queryValues = [id];

    const response = await pool.query<Campaign>(queryText, queryValues);

    if (response.rows.length) {
      return objectKeysToCamelCase(response.rows[0]) as Campaign;
    }

    return null;
  },

  async list(query: ListCampaignsQuery = {}): Promise<Page<Campaign>> {
    const { page = 0, pageSize = 50 } = query;

    const queryTextList = `
      SELECT
        *
      FROM
        campaigns
      ORDER BY created_at ASC
      LIMIT $1 OFFSET $2
    `;
    const queryValues = [pageSize, page * pageSize];
    const queryTextCount = `
      SELECT
        COUNT(*)
      FROM
        campaigns
      `;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const response = await client.query<Campaign>(queryTextList, queryValues);
      const count = await client.query<SqlCount>(queryTextCount);

      await client.query('COMMIT');

      return {
        results: response.rows.map((row) => objectKeysToCamelCase(row) as Campaign),
        total: +count.rows[0].count,
      };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },
};

export default pgCampaignRepository;
