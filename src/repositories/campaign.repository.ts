import type { QueryResult } from 'pg';
import pool from '../drivers/postgresql';
import type { Campaign, CreateCampaignDto } from '../interfaces/domain/campaign.types';
import type { Page } from '../interfaces/common';
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

    const queryText = `
      SELECT
        *
      FROM
        campaigns
      LIMIT $1 OFFSET $2
    `;
    const queryValues = [pageSize, page];

    const response = (await pool.query(queryText, queryValues)) as QueryResult<Campaign>;

    return {
      results: response.rows.map((row) => objectKeysFromSnakeCaseToCamelCase(row) as Campaign),
      total: response.rows.length,
    };
  },
};

export default pgCampaignRepository;
