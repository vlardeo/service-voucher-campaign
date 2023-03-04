import z from 'zod';
import { CampaignCurrency } from '@/interfaces/domain/campaign.types';
import { MAX_VOUCHER_BATCH_CREATION_AMOUNT } from '@/services/voucher.service';

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

const BatchCreateVoucherSchema = z.object({
  query: z
    .object({
      amount: z.coerce.number().min(1).max(MAX_VOUCHER_BATCH_CREATION_AMOUNT),
    })
    .strict(),
  params: z
    .object({
      campaignId: z.string().uuid(),
    })
    .strict(),
});

export { CreateCampaignSchema, ListCampaignSchema, BatchCreateVoucherSchema };
