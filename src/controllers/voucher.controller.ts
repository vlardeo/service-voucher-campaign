import type { Request, Response, NextFunction } from 'express';
import voucherService from '@/services/voucher.service';

export type VoucherBatchCreateRequest = Request<{ campaignId: string }, null, null, { amount: string }>;
export type VoucherListPerCampaignRequest = Request<{ campaignId: string }, null, null, { page?: string; pageSize?: string }>;

const voucherController = {
  voucherBatchCreate: async (req: VoucherBatchCreateRequest, res: Response, next: NextFunction) => {
    const { campaignId } = req.params;
    const { amount } = req.query;

    try {
      const response = await voucherService.createBatch(campaignId, +amount);

      res.status(201).json(response);
    } catch (err: any) {
      next(err);
    }
  },

  listVouchersPerCampaign: async (req: VoucherListPerCampaignRequest, res: Response, next: NextFunction) => {
    const { campaignId } = req.params;
    const { page = 0, pageSize = 50 } = req.query;

    try {
      const { total, results } = await voucherService.listVouchersPerCampaign({
        campaignId,
        page: +page,
        pageSize: +pageSize,
      });

      res.set('X-Total-Count', String(total)).status(200).json(results);
    } catch (err: any) {
      next(err);
    }
  },
};

export default voucherController;
