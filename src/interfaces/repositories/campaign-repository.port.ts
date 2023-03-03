import type { Campaign, CreateCampaignDto } from '../domain/campaign.types';
import type { OffsetPagination, Page } from '../common';

export type ListCampaignsQuery = Partial<OffsetPagination>;

export interface SqlCampaignRepositoryPort {
  create(input: CreateCampaignDto): Promise<Campaign>;
  findById(id: string): Promise<Campaign | null>;
  list(query?: ListCampaignsQuery): Promise<Page<Campaign>>;
}
