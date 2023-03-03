import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import campaignController from '../controllers/campaign.controller';
import validate from '../middlewares/schema-validator';
import { CreateCampaignSchema, ListCampaignSchema } from '../controllers/campaign-controller.schema';

export default function campaignRouter() {
  const router = express.Router();

  router.post('/', validate(CreateCampaignSchema), async (req: Request, res: Response, next: NextFunction) =>
    campaignController.create(req, res, next),
  );

  router.get('/', validate(ListCampaignSchema), async (req: Request, res: Response, next: NextFunction) => campaignController.list(req, res, next));

  return router;
}
