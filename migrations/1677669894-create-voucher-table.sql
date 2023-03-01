-- Migration: create-voucher-table
-- Created at: 2023-03-01 15:24:54

-- ====  UP  ====
BEGIN;

CREATE TABLE "vouchers" (
  "id" UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v1(),
  "campaign_id" UUID NOT NULL,
  "discount_code" VARCHAR(17) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_voucher_campaign_id FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
);

CREATE TRIGGER "update_vouchers_updated_at" BEFORE UPDATE
ON "vouchers" FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();

COMMIT;

-- ==== DOWN ====
BEGIN;

DROP TRIGGER "update_vouchers_updated_at" ON "vouchers";

DROP TABLE "vouchers";

COMMIT;
