import z from 'zod';

const BatchCreateVoucherSchema = z.object({
  query: z
    .object({
      amount: z.coerce.number().min(1).max(500),
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
});

export { BatchCreateVoucherSchema, ListVouchersPerCampaignSchema };
