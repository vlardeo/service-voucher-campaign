import type { OffsetPagination, Page } from '@/interfaces/common';
import type { Voucher } from '@/interfaces/domain/voucher.types';

export type BatchCreateVoucherProps = {
  campaignId: string;
  discountCodes: string[];
};

export type CreateVoucherResponse = { created: number };

export type ListVouchersQuery = Partial<OffsetPagination>;

export interface SqlVoucherRepositoryPort {
  list(query?: ListVouchersQuery): Promise<Page<Voucher>>;
  createBatch(input: BatchCreateVoucherProps): Promise<CreateVoucherResponse>;
  getDuplicates(campaignId: string, discountCode: string[]): Promise<Voucher[]>;
}
