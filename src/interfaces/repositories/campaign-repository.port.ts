import type { Campaign, CreateCampaignDto } from '@/interfaces/domain/campaign.types';
import type { OffsetPagination, Page } from '@/common/types';

export type ListCampaignsQuery = Partial<OffsetPagination>;

export interface SqlCampaignRepositoryPort {
  create(input: CreateCampaignDto): Promise<Campaign>;
  findById(id: string): Promise<Campaign | null>;
  list(query?: ListCampaignsQuery): Promise<Page<Campaign>>;
}
