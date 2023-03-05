import type { Page } from '@/common/types';
import type { Voucher } from '@/interfaces/domain/voucher.types';
import type { SqlVoucherRepositoryPort, CreateVoucherResponse } from '@/interfaces/repositories/voucher-repository.port';

const aVoucherRepository: SqlVoucherRepositoryPort = {
  listVouchersPerCampaign: jest.fn(async () => ({} as Promise<Page<Voucher>>)),
  createBatch: jest.fn(async () => ({} as Promise<CreateVoucherResponse>)),
  getDuplicates: jest.fn(async () => []),
};

export default aVoucherRepository;
