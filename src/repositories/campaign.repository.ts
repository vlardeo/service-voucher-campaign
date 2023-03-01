import type { QueryResult } from 'pg';
import pool from '../drivers/postgresql';
import type { Campaign, CreateCampaignDto } from '../interfaces/domain/campaign.types';
import type { SqlCampaignRepositoryPort } from '../interfaces/repositories/campaign-repository.port';
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
};

export default pgCampaignRepository;
