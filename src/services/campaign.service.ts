import type { CreateCampaignDto } from '../interfaces/domain/campaign.types';
import campaignRepository from '../repositories/campaign.repository';

const campaignService = {
  create: async (input: CreateCampaignDto) => {
    return campaignRepository.create(input);
  },
};

export default campaignService;
