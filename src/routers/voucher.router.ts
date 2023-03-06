import express from 'express';
import validate from '@/middlewares/schema-validator';
import { BatchCreateVoucherSchema, ListVouchersPerCampaignSchema } from '@/controllers/voucher-controller.schema';
import voucherController from '@/controllers/voucher.controller';

export default function voucherRouter() {
  const router = express.Router({ mergeParams: true });

  router.get('/vouchers', validate(ListVouchersPerCampaignSchema), voucherController.listVouchersPerCampaign);

  router.get('/vouchers/download/csv', voucherController.downloadVouchersAsCsv);

  router.post('/vouchers/batch', validate(BatchCreateVoucherSchema), voucherController.voucherBatchCreate);

  return router;
}
