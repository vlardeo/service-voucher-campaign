import pool from '@/drivers/postgresql';
import pgVoucherRepository from '@/repositories/voucher.repository';
import { generateDiscountCode } from '@/utils/generate-discount-code';
import { aCampaign } from '@tests/builders/campaign.builder';
import { aVoucher } from '@tests/builders/voucher.builder';
import flush from '@tests/flush';

describe('@repositories/pg-voucher-repository', () => {
  afterEach(async () => {
    await flush(pool);
  });

  describe('listVouchersPerCampaign()', () => {
    describe('when there are no vouchers in campaign', () => {
      it('returns an empty array as result and 0 as total count', async () => {
        // First campaign with vouchers
        const campaign1 = await aCampaign({}).build();
        await Promise.all([aVoucher({ campaignId: campaign1.id }).build(), aVoucher({ campaignId: campaign1.id }).build()]);

        // Second campaign without vouchers
        const campaign2 = await aCampaign({}).build();

        await expect(pgVoucherRepository.listVouchersPerCampaign({ campaignId: campaign2.id })).resolves.toEqual({
          results: [],
          total: 0,
        });
      });
    });

    describe('when there are vouchers in campaign', () => {
      describe('when called without query parameters', () => {
        it('returns array of results and total count', async () => {
          const campaign = await aCampaign({}).build();
          const vouchers = await Promise.all([
            aVoucher({ campaignId: campaign.id }).build(),
            aVoucher({ campaignId: campaign.id }).build(),
            aVoucher({ campaignId: campaign.id }).build(),
            aVoucher({ campaignId: campaign.id }).build(),
            aVoucher({ campaignId: campaign.id }).build(),
          ]);

          await expect(pgVoucherRepository.listVouchersPerCampaign({ campaignId: campaign.id })).resolves.toEqual({
            results: expect.arrayContaining(vouchers),
            total: 5,
          });
        });
      });

      describe('when called with query parameters', () => {
        describe('when called with pagination params', () => {
          it('should paginate and returns array of results and total count', async () => {
            const campaign = await aCampaign({}).build();

            await aVoucher({ campaignId: campaign.id }).build();
            await aVoucher({ campaignId: campaign.id }).build();
            const voucher1 = await aVoucher({ campaignId: campaign.id }).build();
            const voucher2 = await aVoucher({ campaignId: campaign.id }).build();

            await expect(pgVoucherRepository.listVouchersPerCampaign({ campaignId: campaign.id, page: 1, pageSize: 2 })).resolves.toEqual({
              results: expect.arrayContaining([voucher1, voucher2]),
              total: 4,
            });
          });
        });
      });
    });
  });

  describe('createBatch()', () => {
    it('batch creates campaigns and returns response with number of created campaigns', async () => {
      const { id: campaignId, prefix } = await aCampaign({}).build();

      const BATCH_CREATE_INPUT = {
        campaignId,
        discountCodes: [`${generateDiscountCode(prefix)}`, `${generateDiscountCode(prefix)}`, `${generateDiscountCode(prefix)}`],
      };

      const { created } = await pgVoucherRepository.createBatch(BATCH_CREATE_INPUT);
      expect(created).toBe(3);

      const { total } = await pgVoucherRepository.listVouchersPerCampaign({ campaignId });
      expect(total).toBe(3);
    });
  });

  describe('getDuplicates()', () => {
    it('returns duplicated entities', async () => {
      const { id: campaignId, prefix } = await aCampaign({}).build();

      const [DISCOUNT_CODE_A, DISCOUNT_CODE_B, DISCOUNT_CODE_C] = [
        `${generateDiscountCode(prefix)}`,
        `${generateDiscountCode(prefix)}`,
        `${generateDiscountCode(prefix)}`,
      ];

      await aVoucher({ campaignId, discountCode: DISCOUNT_CODE_A }).build();
      await aVoucher({ campaignId, discountCode: DISCOUNT_CODE_B }).build();

      const duplicatedVouchers = await pgVoucherRepository.getDuplicates(campaignId, [DISCOUNT_CODE_A, DISCOUNT_CODE_B, DISCOUNT_CODE_C]);
      expect(duplicatedVouchers).toHaveLength(2);
      expect(duplicatedVouchers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ discountCode: DISCOUNT_CODE_A }),
          expect.objectContaining({ discountCode: DISCOUNT_CODE_B }),
        ]),
      );
    });
  });
});
