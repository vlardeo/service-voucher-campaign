import express from 'express';
import campaignController from '@/controllers/campaign.controller';
import validate from '@/middlewares/schema-validator';
import {
  CreateCampaignSchema,
  ListCampaignSchema,
  BatchCreateVoucherSchema,
  ListVouchersPerCampaignSchema,
  DeleteCampaignSchema,
} from '@/controllers/campaign-controller.schema';

export default function campaignRouter() {
  const router = express.Router();

  router.get('/', validate(ListCampaignSchema), campaignController.list);

  router.get('/:campaignId/vouchers', validate(ListVouchersPerCampaignSchema), campaignController.listVouchersPerCampaign);

  router.post('/', validate(CreateCampaignSchema), campaignController.create);

  router.post('/:campaignId/vouchers/batch', validate(BatchCreateVoucherSchema), campaignController.voucherBatchCreate);

  router.delete('/:campaignId', validate(DeleteCampaignSchema), campaignController.delete);

  return router;
}
