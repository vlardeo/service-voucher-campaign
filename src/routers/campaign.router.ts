import express from 'express';
import campaignController from '@/controllers/campaign.controller';
import validate from '@/middlewares/schema-validator';
import { CreateCampaignSchema, ListCampaignSchema } from '@/controllers/campaign-controller.schema';

export default function campaignRouter() {
  const router = express.Router();

  router.post('/', validate(CreateCampaignSchema), campaignController.create);

  router.get('/', validate(ListCampaignSchema), campaignController.list);

  return router;
}
