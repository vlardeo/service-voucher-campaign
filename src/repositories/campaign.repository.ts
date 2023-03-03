import type { QueryResult } from 'pg';
import pool from '../drivers/postgresql';
import type { Campaign, CreateCampaignDto } from '../interfaces/domain/campaign.types';
import type { Page, SqlCount } from '../interfaces/common';
import type { ListCampaignsQuery, SqlCampaignRepositoryPort } from '../interfaces/repositories/campaign-repository.port';
import { objectKeysFromSnakeCaseToCamelCase } from '../utils/case-convert';

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
    const queryValues = Object.values(input);

    const response = (await pool.query(queryText, queryValues)) as QueryResult<Campaign>;

    return objectKeysFromSnakeCaseToCamelCase(response.rows[0]) as Campaign;
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

    const response = (await pool.query(queryText, queryValues)) as QueryResult<Campaign>;

    if (response.rows.length) {
      return objectKeysFromSnakeCaseToCamelCase(response.rows[0]) as Campaign;
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
      LIMIT $1 OFFSET $2
    `;
    const queryValues = [pageSize, page];
    const queryTextCount = `
      SELECT
        COUNT(*)
      FROM
        campaigns
      `;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const response = (await client.query(queryTextList, queryValues)) as QueryResult<Campaign>;
      const count = (await client.query(queryTextCount)) as QueryResult<SqlCount>;

      await client.query('COMMIT');

      return {
        results: response.rows.map((row) => objectKeysFromSnakeCaseToCamelCase(row) as Campaign),
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
