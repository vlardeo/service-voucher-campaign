import type { Page } from '../../src/interfaces/common';
import type { Campaign } from '../../src/interfaces/domain/campaign.types';
import type { SqlCampaignRepositoryPort } from '../../src/interfaces/repositories/campaign-repository.port';

const aCampaignRepository: SqlCampaignRepositoryPort = {
  create: jest.fn(async () => ({} as Promise<Campaign>)),
  findById: jest.fn(async () => ({} as Promise<Campaign>)),
  list: jest.fn(async () => ({} as Promise<Page<Campaign>>)),
};

export default aCampaignRepository;
