import type { CreateCampaignDto } from '@/interfaces/domain/campaign.types';
import type { ListCampaignsQuery } from '@/interfaces/repositories/campaign-repository.port';
import campaignRepository from '@/repositories/campaign.repository';

const campaignService = {
  create: async (input: CreateCampaignDto) => {
    return campaignRepository.create(input);
  },

  list: async (input?: ListCampaignsQuery) => {
    return campaignRepository.list(input);
  },
};

export default campaignService;
