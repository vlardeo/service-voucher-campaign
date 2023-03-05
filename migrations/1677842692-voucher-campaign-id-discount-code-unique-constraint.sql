-- Migration: voucher-campaign-id-discount-code-unique-constraint
-- Created at: 2023-03-03 15:24:52

-- ====  UP  ====
ALTER TABLE "vouchers"
  ADD CONSTRAINT "unique_campaign_id_discount_code_constraint" UNIQUE ("campaign_id", "discount_code");

-- ==== DOWN ====
ALTER TABLE "vouchers"
  DROP CONSTRAINT "unique_campaign_id_discount_code_constraint";
