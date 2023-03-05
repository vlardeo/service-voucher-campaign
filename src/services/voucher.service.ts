import { ResourceNotFoundError, ValidationError } from '@/common/errors';
import type { ListVouchersQuery } from '@/interfaces/repositories/voucher-repository.port';
import pgCampaignRepository from '@/repositories/campaign.repository';
import pgVoucherRepository from '@/repositories/voucher.repository';
import { generateSetOfUniqDiscountCodes } from '@/utils/generate-discount-code';

export const MAX_VOUCHER_BATCH_CREATION_AMOUNT = 100;

const voucherService = {
  createBatch: async (campaignId: string, amount: number) => {
    const campaign = await pgCampaignRepository.findById(campaignId);

    if (amount > MAX_VOUCHER_BATCH_CREATION_AMOUNT) {
      throw new ValidationError(`Can't generate more than ${MAX_VOUCHER_BATCH_CREATION_AMOUNT} vouchers at a time`);
    }

    if (!campaign) {
      throw new ResourceNotFoundError(`Voucher campaign`, campaignId);
    }

    const { prefix } = campaign;

    let uniqDiscountCodes = generateSetOfUniqDiscountCodes(amount, prefix);
    let duplicatedVouchers = await pgVoucherRepository.getDuplicates(campaignId, [...uniqDiscountCodes]);

    // If there are already some vouchers with the same codes for this campaign, we want to regenerate codes to keep code uniqueness per campaign
    while (duplicatedVouchers.length) {
      // Filter out duplicates
      duplicatedVouchers.map(({ discountCode }) => uniqDiscountCodes.delete(discountCode));

      // Add remaining codes to the set
      uniqDiscountCodes = generateSetOfUniqDiscountCodes(amount, prefix, uniqDiscountCodes);
      // Recheck duplicates
      duplicatedVouchers = await pgVoucherRepository.getDuplicates(campaignId, [...uniqDiscountCodes]);
    }

    const vouchersBatchCreatePayload = { campaignId, discountCodes: [...uniqDiscountCodes] };

    return pgVoucherRepository.createBatch(vouchersBatchCreatePayload);
  },

  listVouchersPerCampaign: async (input: ListVouchersQuery) => {
    const { campaignId } = input;

    const campaign = await pgCampaignRepository.findById(campaignId);

    if (!campaign) {
      throw new ResourceNotFoundError(`Voucher campaign`, campaignId);
    }

    return pgVoucherRepository.listVouchersPerCampaign(input);
  },
};

export default voucherService;
