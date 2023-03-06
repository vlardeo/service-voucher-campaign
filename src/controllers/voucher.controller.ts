import type { Request, Response, NextFunction } from 'express';
import voucherService from '@/services/voucher.service';
import Papa from 'papaparse';
import campaignService from '@/services/campaign.service';

export type VoucherBatchCreateRequest = Request<{ campaignId: string }, null, null, { amount: string }>;
export type VoucherListPerCampaignRequest = Request<{ campaignId: string }, null, null, { page?: string; pageSize?: string }>;
export type DownloadVouchersAsCsv = Request<{ campaignId: string }>;

const EXPORT_CSV_PAGE_SIZE = 500;

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

  downloadVouchersAsCsv: async (req: DownloadVouchersAsCsv, res: Response, next: NextFunction) => {
    const { campaignId } = req.params;

    try {
      const campaign = await campaignService.findById(campaignId);

      if (!campaign) {
        res.status(404).send({ error: `Campaign ${campaignId} doesn't exist` });
      }

      let page = 0;
      let { results } = await voucherService.listVouchersPerCampaign({ campaignId, page, pageSize: EXPORT_CSV_PAGE_SIZE });

      if (!results.length) {
        res.status(404).send({ error: `Vouchers for campaign ${campaignId} don't exist` });
      }

      let csv = '';

      res.set('Content-Type', 'text/csv');
      res.set('Content-Disposition', `attachment; filename=vouchers-${campaignId}.csv`);

      // While there are vouchers, we convert it to the CSV, stream to the client and get another page of vouchers
      while (results.length) {
        page++;

        csv = Papa.unparse(results);
        res.write(csv);

        ({ results } = await voucherService.listVouchersPerCampaign({ campaignId, page, pageSize: EXPORT_CSV_PAGE_SIZE }));
      }

      res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  },
};

export default voucherController;
