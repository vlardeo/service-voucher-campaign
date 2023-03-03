import { Campaign, CampaignCurrency } from '../../src/interfaces/domain/campaign.types';
import type { BuilderInterface } from './builder.interface';
import pool from '../../src/drivers/postgresql';
import type { QueryResult } from 'pg';
import { generateUuid } from '../../src/utils/uuid';
import { objectKeysFromSnakeCaseToCamelCase } from '../../src/utils/case-convert';

interface CampaignBuilderInterface {
  id: string;
  prefix: string;
  fromDate: Date;
  toDate: Date;
  amount: number;
  currency: CampaignCurrency;
}

export class CampaignBuilder implements BuilderInterface<Campaign> {
  readonly data!: CampaignBuilderInterface;

  constructor({
    id = generateUuid(),
    prefix = 'RECHARGE',
    fromDate = new Date('2022-01-01'),
    toDate = new Date('2023-01-01'),
    amount = 20,
    currency = CampaignCurrency.USD,
  }: {
    id?: string;
    prefix?: string;
    fromDate?: Date;
    toDate?: Date;
    amount?: number;
    currency?: CampaignCurrency;
  }) {
    this.data = {
      id,
      prefix,
      fromDate,
      toDate,
      amount,
      currency,
    };
  }

  public async build() {
    const queryText = `
    INSERT INTO campaigns (
      id,
      prefix,
      from_date,
      to_date,
      amount,
      currency
    ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
    const response = (await pool.query(queryText, Object.values(this.data))) as QueryResult<Campaign>;

    return objectKeysFromSnakeCaseToCamelCase(response.rows[0]) as Campaign;
  }

  public buildMock() {
    return { ...this.data, createdAt: new Date(), updatedAt: new Date() };
  }
}

export const aCampaign = (data: Partial<CampaignBuilderInterface>) => new CampaignBuilder(data);
