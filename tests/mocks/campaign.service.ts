import type { Page } from '../../src/interfaces/common';
import type { Campaign } from '../../src/interfaces/domain/campaign.types';

const aCampaignService = {
  create: jest.fn(async () => ({} as Promise<Campaign>)),
  list: jest.fn(async () => ({} as Promise<Page<Campaign>>)),
};

export default aCampaignService;
