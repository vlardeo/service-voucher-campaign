import { generateSetOfUniqDiscountCodes } from '@/utils/generate-discount-code';
jest.mock('@/utils/generate-discount-code');

import aCampaignRepository from '@tests/mocks/campaign.repository';
import aVoucherRepository from '@tests/mocks/voucher.repository';
jest.mock('@/repositories/campaign.repository', () => aCampaignRepository);
jest.mock('@/repositories/voucher.repository', () => aVoucherRepository);

import voucherService from '@/services/voucher.service';
import { generateUuid } from '@/utils/uuid';
import { ResourceNotFoundError, ValidationError } from '@/common/errors';
import { aCampaign } from '@tests/builders/campaign.builder';
import { aVoucher } from '@tests/builders/voucher.builder';

describe('@services/voucher-service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBatch()', () => {
    describe('when batch voucher creation amount bigger than max allowed amount', () => {
      it('throws ValidationError', async () => {
        const CAMPAIGN_ID = generateUuid();
        const AMOUNT = 1000;

        await expect(voucherService.createBatch(CAMPAIGN_ID, AMOUNT)).rejects.toThrow(ValidationError);
        expect(aVoucherRepository.createBatch).not.toHaveBeenCalled();
      });
    });

    describe("when voucher campaign doesn't exist", () => {
      it('throws ResourceNotFoundError', async () => {
        const CAMPAIGN_ID = generateUuid();
        const AMOUNT = 5;

        (aCampaignRepository.findById as jest.Mock).mockResolvedValueOnce(null);

        await expect(voucherService.createBatch(CAMPAIGN_ID, AMOUNT)).rejects.toThrow(ResourceNotFoundError);
        expect(aVoucherRepository.createBatch).not.toHaveBeenCalled();
      });
    });

    describe('when voucher campaign exists', () => {
      describe('when there are no vouchers with codes equal to new generated codes', () => {
        it('should generate new uniq voucher codes once and call voucher repository for creation', async () => {
          const GENERATED_CODES = ['RECHARGE-1', 'RECHARGE-2'];
          const CAMPAIGN = aCampaign({}).buildMock();
          const AMOUNT = 2;

          (aCampaignRepository.findById as jest.Mock).mockResolvedValueOnce(CAMPAIGN);
          (generateSetOfUniqDiscountCodes as jest.Mock).mockReturnValueOnce(new Set(GENERATED_CODES));
          (aVoucherRepository.getDuplicates as jest.Mock).mockResolvedValueOnce([]);
          (aVoucherRepository.createBatch as jest.Mock).mockResolvedValueOnce({ created: AMOUNT });

          await expect(voucherService.createBatch(CAMPAIGN.id, AMOUNT)).resolves.toEqual({ created: AMOUNT });

          // Expect that we generate codes and check duplicates only once
          expect(generateSetOfUniqDiscountCodes).toHaveBeenCalledTimes(1);
          expect(aVoucherRepository.getDuplicates).toHaveBeenCalledTimes(1);

          expect(aVoucherRepository.createBatch).toHaveBeenCalledWith({ campaignId: CAMPAIGN.id, discountCodes: GENERATED_CODES });
        });
      });

      describe('when there are vouchers with codes equal to new generated codes', () => {
        it('should regenerate duplicated voucher codes and call voucher repository with uniq vouchers codes', async () => {
          const [UNIQ_CODE_1, UNIQ_CODE_2, DUPLICATED_CODE_1, DUPLICATED_CODE_2] = [
            'UNIQ_CODE_1',
            'UNIQ_CODE_2',
            'DUPLICATED_CODE_1',
            'DUPLICATED_CODE_2',
          ];
          const CAMPAIGN = aCampaign({}).buildMock();
          const [DUPLICATED_VOUCHER_1, DUPLICATED_VOUCHER_2] = [
            aVoucher({ campaignId: CAMPAIGN.id, discountCode: DUPLICATED_CODE_1 }).buildMock(),
            aVoucher({ campaignId: CAMPAIGN.id, discountCode: DUPLICATED_CODE_2 }).buildMock(),
          ];
          const AMOUNT = 2;

          (aCampaignRepository.findById as jest.Mock).mockResolvedValueOnce(CAMPAIGN);

          // First generate: 1 uniq code, 1 duplicate
          (generateSetOfUniqDiscountCodes as jest.Mock).mockReturnValueOnce(new Set([UNIQ_CODE_1, DUPLICATED_CODE_1]));
          (aVoucherRepository.getDuplicates as jest.Mock).mockResolvedValueOnce([DUPLICATED_VOUCHER_1]);

          // Second generate: keep already generated uniq code, regenerate another code, but it will be duplicate as well (shit happens ¯\_(ツ)_/¯)
          (generateSetOfUniqDiscountCodes as jest.Mock).mockReturnValueOnce(new Set([UNIQ_CODE_1, DUPLICATED_CODE_2]));
          (aVoucherRepository.getDuplicates as jest.Mock).mockResolvedValueOnce([DUPLICATED_VOUCHER_2]);

          // Third generate: keep already generated uniq code, regenerate another code, this time it will be uniq
          (generateSetOfUniqDiscountCodes as jest.Mock).mockReturnValueOnce(new Set([UNIQ_CODE_1, UNIQ_CODE_2]));
          (aVoucherRepository.getDuplicates as jest.Mock).mockResolvedValueOnce([]);

          (aVoucherRepository.createBatch as jest.Mock).mockResolvedValueOnce({ created: AMOUNT });

          await expect(voucherService.createBatch(CAMPAIGN.id, AMOUNT)).resolves.toEqual({ created: AMOUNT });

          // Expect that we generate codes and check duplicates until we have list of uniq codes
          expect(generateSetOfUniqDiscountCodes).toHaveBeenCalledTimes(3);
          expect(aVoucherRepository.getDuplicates).toHaveBeenCalledTimes(3);

          // Call first time without codes
          expect(generateSetOfUniqDiscountCodes).toHaveBeenCalledWith(AMOUNT, CAMPAIGN.prefix);
          // Call second time with only uniq code
          expect(generateSetOfUniqDiscountCodes).toHaveBeenCalledWith(AMOUNT, CAMPAIGN.prefix, new Set([UNIQ_CODE_1]));
          // Call third time with only uniq code
          expect(generateSetOfUniqDiscountCodes).toHaveBeenCalledWith(AMOUNT, CAMPAIGN.prefix, new Set([UNIQ_CODE_1]));

          // Call first time with uniq and duplicated code
          expect(aVoucherRepository.getDuplicates).toHaveBeenCalledWith(CAMPAIGN.id, [UNIQ_CODE_1, DUPLICATED_CODE_1]);
          // Call second time with uniq and another duplicated code
          expect(aVoucherRepository.getDuplicates).toHaveBeenCalledWith(CAMPAIGN.id, [UNIQ_CODE_1, DUPLICATED_CODE_2]);
          // Call third time with uniq codes
          expect(aVoucherRepository.getDuplicates).toHaveBeenCalledWith(CAMPAIGN.id, [UNIQ_CODE_1, UNIQ_CODE_2]);

          expect(aVoucherRepository.createBatch).toHaveBeenCalledWith({ campaignId: CAMPAIGN.id, discountCodes: [UNIQ_CODE_1, UNIQ_CODE_2] });
        });
      });
    });
  });

  describe('listVouchersPerCampaign()', () => {
    describe('when there is no campaign', () => {
      it('should throw ResourceNotFoundError', async () => {
        const CAMPAIGN_ID = generateUuid();
        (aCampaignRepository.findById as jest.Mock).mockResolvedValueOnce(null);
        await expect(voucherService.listVouchersPerCampaign({ campaignId: CAMPAIGN_ID })).rejects.toThrow(ResourceNotFoundError);
      });
    });

    describe('when there is campaign', () => {
      it('should call repository to list vouchers per campaign and get total count', async () => {
        const campaign = aCampaign({}).buildMock();
        const vouchers = [aVoucher({ campaignId: campaign.id }).buildMock(), aVoucher({ campaignId: campaign.id }).buildMock()];

        (aCampaignRepository.findById as jest.Mock).mockResolvedValueOnce(campaign);
        (aVoucherRepository.listVouchersPerCampaign as jest.Mock).mockResolvedValueOnce({ total: 2, results: vouchers });

        await expect(voucherService.listVouchersPerCampaign({ campaignId: campaign.id })).resolves.toEqual({
          total: 2,
          results: expect.arrayContaining(vouchers),
        });
        expect(aVoucherRepository.listVouchersPerCampaign).toHaveBeenCalledWith({ campaignId: campaign.id });
      });
    });
  });
});
