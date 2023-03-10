import pool from '@/drivers/postgresql';
import flush from '@tests/flush';
import { CampaignCurrency, CreateCampaignDto } from '@/interfaces/domain/campaign.types';
import pgCampaignRepository from '@/repositories/campaign.repository';
import { generateUuid } from '@tests/uuid';
import { aCampaign } from '@tests/builders/campaign.builder';
import { aVoucher } from '@tests/builders/voucher.builder';
import pgVoucherRepository from '@/repositories/voucher.repository';

describe('@repositories/pg-campaign-repository', () => {
  afterEach(async () => {
    await flush(pool);
  });

  describe('create()', () => {
    it('creates and returns a campaign', async () => {
      const CAMPAIGN_DTO = {
        prefix: 'RECHARGE',
        fromDate: '2023-01-01T00:00:00.000Z',
        toDate: '2023-02-01T00:00:00.000Z',
        amount: 20,
        currency: CampaignCurrency.EUR,
      } as CreateCampaignDto;

      await expect(pgCampaignRepository.create(CAMPAIGN_DTO)).resolves.toEqual(
        expect.objectContaining({
          prefix: CAMPAIGN_DTO.prefix,
          fromDate: new Date(CAMPAIGN_DTO.fromDate),
          toDate: new Date(CAMPAIGN_DTO.toDate),
          amount: CAMPAIGN_DTO.amount,
          currency: CAMPAIGN_DTO.currency,
        }),
      );
    });
  });

  describe('findById()', () => {
    describe('when there is no entity', () => {
      it('returns null', async () => {
        const [CAMPAIGN_ID_1, CAMPAIGN_ID_2] = [generateUuid(), generateUuid()];

        await aCampaign({ id: CAMPAIGN_ID_1 }).build();

        await expect(pgCampaignRepository.findById(CAMPAIGN_ID_2)).resolves.toBeNull();
      });
    });

    describe('when there is entity', () => {
      it('returns entity', async () => {
        const CAMPAIGN_ID = generateUuid();

        const campaign = await aCampaign({ id: CAMPAIGN_ID }).build();

        await expect(pgCampaignRepository.findById(CAMPAIGN_ID)).resolves.toEqual(expect.objectContaining(campaign));
      });
    });
  });

  describe('list()', () => {
    describe('when there are no entities', () => {
      it('returns an empty array as result and 0 as total count', async () => {
        await expect(pgCampaignRepository.list()).resolves.toEqual({
          results: [],
          total: 0,
        });
      });
    });

    describe('when there are entities', () => {
      describe('when called without query parameters', () => {
        it('returns array of results and total count', async () => {
          const allCampaigns = await Promise.all([
            aCampaign({}).build(),
            aCampaign({}).build(),
            aCampaign({}).build(),
            aCampaign({}).build(),
            aCampaign({}).build(),
          ]);
          await expect(pgCampaignRepository.list()).resolves.toEqual({
            results: expect.arrayContaining(allCampaigns),
            total: 5,
          });
        });
      });

      describe('when called with query parameters', () => {
        describe('when called with pagination params', () => {
          it('should paginate and returns array of results and total count', async () => {
            await aCampaign({}).build();
            await aCampaign({}).build();
            const campaign1 = await aCampaign({}).build();
            const campaign2 = await aCampaign({}).build();
            await aCampaign({}).build();

            await expect(pgCampaignRepository.list({ page: 1, pageSize: 2 })).resolves.toEqual({
              results: expect.arrayContaining([campaign1, campaign2]),
              total: 5,
            });
          });
        });
      });
    });
  });

  describe('delete()', () => {
    it('should delete vouchers and campaign and return amount of deleted campaign', async () => {
      const campaign = await aCampaign({}).build();
      await Promise.all([aVoucher({ campaignId: campaign.id }).build(), aVoucher({ campaignId: campaign.id }).build()]);

      await expect(pgCampaignRepository.delete(campaign.id)).resolves.toEqual({ deleted: 1 });

      const campaignDb = await pgCampaignRepository.findById(campaign.id);
      expect(campaignDb).toBe(null);

      const { total, results } = await pgVoucherRepository.listVouchersPerCampaign({ campaignId: campaign.id });
      expect(results).toHaveLength(0);
      expect(total).toBe(0);
    });
  });
});
