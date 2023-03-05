import aCampaignRepository from '@tests/mocks/campaign.repository';
jest.mock('@/repositories/campaign.repository', () => aCampaignRepository);

import campaignService from '@/services/campaign.service';
import { aCampaign } from '@tests/builders/campaign.builder';
import { generateUuid } from '@/utils/uuid';
import { ResourceNotFoundError } from '@/common/errors';

describe('@services/campaign-service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should call campaign repository to create campaign', async () => {
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
      expect(aCampaignRepository.create).toHaveBeenCalledWith({
        prefix: campaign.prefix,
        fromDate: campaign.fromDate.toISOString(),
        toDate: campaign.toDate.toISOString(),
        amount: campaign.amount,
        currency: campaign.currency,
      });
    });
  });

  describe('list()', () => {
    it('should call campaign repository to list campaigns', async () => {
      const campaigns = [aCampaign({}).buildMock(), aCampaign({}).buildMock()];
      (aCampaignRepository.list as jest.Mock).mockResolvedValueOnce({
        results: campaigns,
        total: 2,
      });
      const result = await campaignService.list();
      expect(result).toEqual({
        results: expect.arrayContaining(campaigns),
        total: 2,
      });
      expect(aCampaignRepository.list).toHaveBeenCalledWith(undefined);
    });
  });

  describe('delete()', () => {
    describe('when there is no campaign', () => {
      it('should throw ResourceNotFoundError', async () => {
        const CAMPAIGN_ID = generateUuid();
        (aCampaignRepository.findById as jest.Mock).mockResolvedValueOnce(null);
        await expect(campaignService.delete(CAMPAIGN_ID)).rejects.toThrow(ResourceNotFoundError);
      });
    });

    describe('when there is campaign', () => {
      it('should call campaign repository to delete vouchers and campaign', async () => {
        const campaign = aCampaign({}).buildMock();

        (aCampaignRepository.findById as jest.Mock).mockResolvedValueOnce(campaign);
        (aCampaignRepository.delete as jest.Mock).mockResolvedValueOnce({ deleted: 1 });

        await expect(campaignService.delete(campaign.id)).resolves.toEqual({ deleted: 1 });
        expect(aCampaignRepository.delete).toHaveBeenCalledWith(campaign.id);
      });
    });
  });
});
