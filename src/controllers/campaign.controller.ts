import type { Request, Response, NextFunction } from 'express';
import type { CreateCampaignDto } from '../interfaces/domain/campaign.types';
import campaignService from '../services/campaign.service';

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
};

export default campaignController;
