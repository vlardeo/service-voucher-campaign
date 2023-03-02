import type { Campaign } from '../../src/interfaces/domain/campaign.types';
import type { SqlCampaignRepositoryPort } from '../../src/interfaces/repositories/campaign-repository.port';

const aCampaignRepository: SqlCampaignRepositoryPort = {
  create: jest.fn(async () => ({} as Promise<Campaign>)),
};

export default aCampaignRepository;
