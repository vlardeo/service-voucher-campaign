import express from 'express';
import campaignController from '@/controllers/campaign.controller';
import validate from '@/middlewares/schema-validator';
import { CreateCampaignSchema, ListCampaignSchema, CampaignIdParamSchema } from '@/controllers/campaign-controller.schema';
import voucherRouter from '@/routers/voucher.router';

export default function campaignRouter() {
  const router = express.Router({ mergeParams: true });

  router.get('/', validate(ListCampaignSchema), campaignController.list);

  router.post('/', validate(CreateCampaignSchema), campaignController.create);

  router.use('/:campaignId', validate(CampaignIdParamSchema), nestedCampaignRouter());

  return router;
}

function nestedCampaignRouter() {
  const router = express.Router({ mergeParams: true });

  router.delete('/', campaignController.delete);

  router.use('/', voucherRouter());

  return router;
}
