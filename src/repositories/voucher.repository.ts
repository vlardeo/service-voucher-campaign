import pool from '@/drivers/postgresql';
import type { Page, SqlCount } from '@/common/types';
import type { Voucher } from '@/interfaces/domain/voucher.types';
import type {
  BatchCreateVoucherProps,
  CreateVoucherResponse,
  ListVouchersQuery,
  SqlVoucherRepositoryPort,
} from '@/interfaces/repositories/voucher-repository.port';
import { objectKeysToCamelCase } from '@/utils/case-convert';

const pgVoucherRepository: SqlVoucherRepositoryPort = {
  async list(query: ListVouchersQuery = {}): Promise<Page<Voucher>> {
    const { page = 0, pageSize = 50 } = query;

    const queryTextList = `
      SELECT
        *
      FROM
        vouchers
      ORDER BY created_at ASC
      LIMIT $1 OFFSET $2
    `;
    const queryValues = [pageSize, page * pageSize];
    const queryTextCount = `
      SELECT
        COUNT(*)
      FROM
      vouchers
      `;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const response = await client.query<Voucher>(queryTextList, queryValues);
      const count = await client.query<SqlCount>(queryTextCount);

      await client.query('COMMIT');

      return {
        results: response.rows.map((row) => objectKeysToCamelCase(row) as Voucher),
        total: +count.rows[0].count,
      };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async createBatch(input: BatchCreateVoucherProps): Promise<CreateVoucherResponse> {
    const { campaignId, discountCodes } = input;

    // Like '($1, $2), ($3, $4), ...'
    const queryTextValuesTemplate: string[] = [];
    // Like [value1, value2, ...]
    const queryValues: string[] = [];

    let paramsCounter = 0;

    discountCodes.map((discountCode) => {
      queryValues.push(campaignId, discountCode);
      queryTextValuesTemplate.push(`($${++paramsCounter}, $${++paramsCounter})`);
    });

    const queryText = `
      INSERT INTO vouchers (
        campaign_id,
        discount_code
      ) VALUES ${queryTextValuesTemplate}
    `;

    const { rowCount } = await pool.query(queryText, queryValues);

    return { created: rowCount };
  },

  async getDuplicates(campaignId: string, discountCode: string[]): Promise<Voucher[]> {
    // Like '($1, $2, $3, ...)'
    const queryTextValuesTemplate: string[] = [];

    let paramsCounter = 1;
    discountCode.map(() => queryTextValuesTemplate.push(`$${++paramsCounter}`));

    const queryText = `
      SELECT
        *
      FROM
        vouchers
      WHERE
        campaign_id = $1
      AND
        discount_code IN (${queryTextValuesTemplate})
    `;
    const queryValues = [campaignId, ...discountCode];

    const response = await pool.query<Voucher>(queryText, queryValues);

    return response.rows.map((row) => objectKeysToCamelCase(row) as Voucher);
  },
};

export default pgVoucherRepository;
