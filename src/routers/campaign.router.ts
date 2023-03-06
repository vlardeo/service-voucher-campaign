import express from 'express';
import campaignController from '@/controllers/campaign.controller';
import validate from '@/middlewares/schema-validator';
import { CreateCampaignSchema, ListCampaignSchema, DeleteCampaignSchema } from '@/controllers/campaign-controller.schema';
import { BatchCreateVoucherSchema, ListVouchersPerCampaignSchema } from '@/controllers/voucher-controller.schema';
import voucherController from '@/controllers/voucher.controller';

export default function campaignRouter() {
  const router = express.Router();

  router.get('/', validate(ListCampaignSchema), campaignController.list);

  router.get('/:campaignId/vouchers', validate(ListVouchersPerCampaignSchema), voucherController.listVouchersPerCampaign);

  router.post('/', validate(CreateCampaignSchema), campaignController.create);

  router.post('/:campaignId/vouchers/batch', validate(BatchCreateVoucherSchema), voucherController.voucherBatchCreate);

  router.delete('/:campaignId', validate(DeleteCampaignSchema), campaignController.delete);

  return router;
}
