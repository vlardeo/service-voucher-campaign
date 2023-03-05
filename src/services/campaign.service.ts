import { ResourceNotFoundError } from '@/common/errors';
import type { CreateCampaignDto } from '@/interfaces/domain/campaign.types';
import type { ListCampaignsQuery } from '@/interfaces/repositories/campaign-repository.port';
import pgCampaignRepository from '@/repositories/campaign.repository';

const campaignService = {
  create: async (input: CreateCampaignDto) => {
    return pgCampaignRepository.create(input);
  },

  list: async (input?: ListCampaignsQuery) => {
    return pgCampaignRepository.list(input);
  },

  delete: async (id: string) => {
    const campaign = await pgCampaignRepository.findById(id);

    if (!campaign) {
      throw new ResourceNotFoundError(`Voucher campaign`, id);
    }

    return pgCampaignRepository.delete(id);
  },
};

export default campaignService;
