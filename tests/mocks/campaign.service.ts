import type { Campaign } from '../../src/interfaces/domain/campaign.types';

const aCampaignService = {
  create: jest.fn(async () => ({} as Promise<Campaign>)),
};

export default aCampaignService;
