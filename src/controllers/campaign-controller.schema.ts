import z from 'zod';
import { CampaignCurrency } from '../interfaces/domain/campaign.types';

const CreateCampaignSchema = z.object({
  body: z
    .object({
      prefix: z.string().min(1).max(10),
      fromDate: z.string().datetime(),
      toDate: z.string().datetime(),
      amount: z.number().min(1).max(1000000),
      currency: z.enum([CampaignCurrency.EUR, CampaignCurrency.USD]),
    })
    .strict(),
});

const ListCampaignSchema = z.object({
  query: z
    .object({
      page: z.coerce.number().min(0).optional(),
      pageSize: z.coerce.number().min(1).max(500).optional(),
    })
    .strict(),
});

export { CreateCampaignSchema, ListCampaignSchema };
