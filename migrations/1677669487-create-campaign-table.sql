-- Migration: create-campaign-table
-- Created at: 2023-03-01 15:18:07

-- ====  UP  ====
BEGIN;

CREATE TYPE campaign_currency AS ENUM('EUR','USD');

CREATE TABLE "campaigns" (
  "id" UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v1(),
  "prefix" VARCHAR(10) NOT NULL,
  "from_date" TIMESTAMPTZ NOT NULL,
  "to_date" TIMESTAMPTZ NOT NULL,
  "amount" INT NOT NULL,
  "currency" campaign_currency NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER "update_campaigns_updated_at" BEFORE UPDATE
ON "campaigns" FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();

COMMIT;

-- ==== DOWN ====
BEGIN;

DROP TRIGGER "update_campaigns_updated_at" ON "campaigns";

DROP TABLE "campaigns";

DROP TYPE voucher_currency;

COMMIT;
