import type { BuilderInterface } from '@tests/builders/builder.interface';
import pool from '@/drivers/postgresql';
import { generateUuid } from '@/utils/uuid';
import { objectKeysToCamelCase } from '@/utils/case-convert';
import type { Voucher } from '@/interfaces/domain/voucher.types';
import { generateDiscountCode } from '@/utils/generate-discount-code';

interface VoucherBuilderInterface {
  id: string;
  campaignId: string;
  discountCode: string;
}

export class VoucherBuilder implements BuilderInterface<Voucher> {
  readonly data!: VoucherBuilderInterface;

  constructor({
    id = generateUuid(),
    campaignId,
    discountCode = generateDiscountCode('RECHARGE'),
  }: {
    id?: string;
    campaignId: string;
    discountCode?: string;
  }) {
    this.data = {
      id,
      campaignId,
      discountCode,
    };
  }

  public async build() {
    const queryText = `
    INSERT INTO vouchers (
      id,
      campaign_id,
      discount_code
    ) VALUES ($1, $2, $3) RETURNING *
    `;
    const response = await pool.query<Voucher>(queryText, Object.values(this.data));

    return objectKeysToCamelCase(response.rows[0]) as Voucher;
  }

  public buildMock() {
    return { ...this.data, createdAt: new Date(), updatedAt: new Date() };
  }
}

export const aVoucher = (data: { campaignId: string } & Partial<VoucherBuilderInterface>) => new VoucherBuilder(data);
