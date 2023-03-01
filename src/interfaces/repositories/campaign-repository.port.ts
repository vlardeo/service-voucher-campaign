import type { Campaign, CreateCampaignDto } from '../domain/campaign.types';

export interface SqlCampaignRepositoryPort {
  create(input: CreateCampaignDto): Promise<Campaign>;
}
