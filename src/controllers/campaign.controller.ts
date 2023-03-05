import type { Request, Response, NextFunction } from 'express';
import type { CreateCampaignDto } from '@/interfaces/domain/campaign.types';
import campaignService from '@/services/campaign.service';
import voucherService from '@/services/voucher.service';

export type VoucherBatchCreateRequest = Request<{ campaignId: string }, null, null, { amount: string }>;

const campaignController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { prefix, fromDate, toDate, amount, currency }: CreateCampaignDto = req.body;

      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);

      if (startDate.getTime() >= endDate.getTime()) {
        return res.status(400).send({ error: "The campaign's end date should come after its start date" });
      }

      const campaign = await campaignService.create({
        prefix,
        fromDate: startDate.toISOString(),
        toDate: endDate.toISOString(),
        amount,
        currency,
      });

      res.status(201).json(campaign);
    } catch (err: any) {
      next(err);
    }
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    const { page = 0, pageSize = 50 } = req.query;

    try {
      const { total, results } = await campaignService.list({
        page: +page,
        pageSize: +pageSize,
      });

      res.set('X-Total-Count', String(total)).status(200).json(results);
    } catch (err: any) {
      next(err);
    }
  },

  voucherBatchCreate: async (req: VoucherBatchCreateRequest, res: Response, next: NextFunction) => {
    try {
      const { campaignId } = req.params;
      const { amount } = req.query;

      if (isNaN(+amount)) {
        return res.status(400).send({ error: 'Property amount should be number' });
      }

      const response = await voucherService.createBatch(campaignId, +amount);

      res.status(201).json(response);
    } catch (err: any) {
      next(err);
    }
  },
};

export default campaignController;
