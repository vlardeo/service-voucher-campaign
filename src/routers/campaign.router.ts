import express from 'express';
import campaignController from '@/controllers/campaign.controller';
import validate from '@/middlewares/schema-validator';
import {
  CreateCampaignSchema,
  ListCampaignSchema,
  BatchCreateVoucherSchema,
  ListVouchersPerCampaignSchema,
} from '@/controllers/campaign-controller.schema';

export default function campaignRouter() {
  const router = express.Router();

  router.get('/campaigns', validate(ListCampaignSchema), campaignController.list);

  router.get('/campaigns/:campaignId/vouchers', validate(ListVouchersPerCampaignSchema), campaignController.listVouchersPerCampaign);

  router.post('/campaigns', validate(CreateCampaignSchema), campaignController.create);

  router.post('/campaigns/:campaignId/vouchers/batch', validate(BatchCreateVoucherSchema), campaignController.voucherBatchCreate);

  return router;
}
