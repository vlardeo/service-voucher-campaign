import z from 'zod';

const BatchCreateVoucherSchema = z.object({
  query: z
    .object({
      amount: z.coerce.number().min(1).max(100),
    })
    .strict(),
  params: z
    .object({
      campaignId: z.string().uuid(),
    })
    .strict(),
});

const ListVouchersPerCampaignSchema = z.object({
  query: z
    .object({
      page: z.coerce.number().min(0).optional(),
      pageSize: z.coerce.number().min(1).max(500).optional(),
    })
    .strict(),
  params: z
    .object({
      campaignId: z.string().uuid(),
    })
    .strict(),
});

export { BatchCreateVoucherSchema, ListVouchersPerCampaignSchema };
