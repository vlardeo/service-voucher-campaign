import pool from '../../../src/drivers/postgresql';
import flush from '../../../src/utils/flush';
import { CampaignCurrency, CreateCampaignDto } from '../../../src/interfaces/domain/campaign.types';
import pgCampaignRepository from '../../../src/repositories/campaign.repository';
import { generateUuid } from '../../../src/utils/uuid';
import { aCampaign } from '../../builders/campaign.builder';

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

        await aCampaign({ id: CAMPAIGN_ID }).build();

        await expect(pgCampaignRepository.findById(CAMPAIGN_ID)).resolves.toBeDefined();
      });
    });
  });
});
