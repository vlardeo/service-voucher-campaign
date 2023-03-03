import aCampaignRepository from '../../mocks/campaign.repository';
jest.mock('../../../src/repositories/campaign.repository', () => aCampaignRepository);

import campaignService from '../../../src/services/campaign.service';
import { aCampaign } from '../../builders/campaign.builder';

describe('@services/campaign-service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('returns created campaign', async () => {
      const campaign = aCampaign({}).buildMock();
      (aCampaignRepository.create as jest.Mock).mockResolvedValueOnce(campaign);
      const result = await campaignService.create({
        prefix: campaign.prefix,
        fromDate: campaign.fromDate.toISOString(),
        toDate: campaign.toDate.toISOString(),
        amount: campaign.amount,
        currency: campaign.currency,
      });
      expect(result).toEqual(campaign);
    });
  });
});
