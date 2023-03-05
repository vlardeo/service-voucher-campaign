import type { Page } from '@/common/types';
import type { Voucher } from '@/interfaces/domain/voucher.types';

const aVoucherService = {
  createBatch: jest.fn(async () => {}),
  listVouchersPerCampaign: jest.fn(async () => ({} as Promise<Page<Voucher>>)),
};

export default aVoucherService;
