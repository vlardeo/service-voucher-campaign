import type { Page } from '@/common/types';
import type { Campaign } from '@/interfaces/domain/campaign.types';

const aCampaignService = {
  create: jest.fn(async () => ({} as Promise<Campaign>)),
  list: jest.fn(async () => ({} as Promise<Page<Campaign>>)),
};

export default aCampaignService;
