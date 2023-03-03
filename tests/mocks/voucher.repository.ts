import type { Page } from '@/interfaces/common';
import type { Voucher } from '@/interfaces/domain/voucher.types';
import type { SqlVoucherRepositoryPort, CreateVoucherResponse } from '@/interfaces/repositories/voucher-repository.port';

const aVoucherRepository: SqlVoucherRepositoryPort = {
  list: jest.fn(async () => ({} as Promise<Page<Voucher>>)),
  createBatch: jest.fn(async () => ({} as Promise<CreateVoucherResponse>)),
  getDuplicates: jest.fn(async () => []),
};

export default aVoucherRepository;
