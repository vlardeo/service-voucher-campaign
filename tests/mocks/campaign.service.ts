import type { Page } from '@/common/types';
import type { Campaign } from '@/interfaces/domain/campaign.types';
import type { DeleteCampaignResponse } from '@/interfaces/repositories/campaign-repository.port';

const aCampaignService = {
  create: jest.fn(async () => ({} as Promise<Campaign>)),
  list: jest.fn(async () => ({} as Promise<Page<Campaign>>)),
  delete: jest.fn(async () => ({} as Promise<DeleteCampaignResponse>)),
};

export default aCampaignService;
