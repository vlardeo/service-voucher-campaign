import type { Page } from '@/interfaces/common';
import type { Campaign } from '@/interfaces/domain/campaign.types';
import type { SqlCampaignRepositoryPort } from '@/interfaces/repositories/campaign-repository.port';

const aCampaignRepository: SqlCampaignRepositoryPort = {
  create: jest.fn(async () => ({} as Promise<Campaign>)),
  findById: jest.fn(async () => ({} as Promise<Campaign>)),
  list: jest.fn(async () => ({} as Promise<Page<Campaign>>)),
};

export default aCampaignRepository;
