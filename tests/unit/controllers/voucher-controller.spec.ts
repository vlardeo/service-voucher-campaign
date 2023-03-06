import aVoucherService from '@tests/mocks/voucher.service';
jest.mock('@/services/voucher.service', () => aVoucherService);

import aCampaignService from '@tests/mocks/campaign.service';
jest.mock('@/services/campaign.service', () => aCampaignService);

import { aCampaign } from '@tests/builders/campaign.builder';
import { mockNext, mockResponse } from '@tests/mocks/express-api';
import { generateUuid } from '@tests/uuid';
import { aVoucher } from '@tests/builders/voucher.builder';
import type { VoucherBatchCreateRequest, VoucherListPerCampaignRequest } from '@/controllers/voucher.controller';
import voucherController from '@/controllers/voucher.controller';

describe('@controllers/voucher-controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('voucherBatchCreate()', () => {
    let req: VoucherBatchCreateRequest;

    beforeEach(() => {
      req = {} as VoucherBatchCreateRequest;
    });

    describe('when request is valid', () => {
      it('should send response with status code 201 and number of created vouchers', async () => {
        const CAMPAIGN_ID = generateUuid();
        req.params = { campaignId: CAMPAIGN_ID };
        req.query = { amount: '10' };

        (aVoucherService.createBatch as jest.Mock).mockResolvedValueOnce({ created: 10 });

        await voucherController.voucherBatchCreate(req, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith({ created: 10 });
      });
    });
  });

  describe('listVouchersPerCampaign()', () => {
    let req: VoucherListPerCampaignRequest;

    beforeEach(() => {
      req = { query: {}, params: {} } as VoucherListPerCampaignRequest;
    });

    it('should send response with array of results, total count header and status code 200', async () => {
      const campaign = aCampaign({}).buildMock();
      const vouchers = [aVoucher({ campaignId: campaign.id }).buildMock(), aVoucher({ campaignId: campaign.id }).buildMock()];
      (aVoucherService.listVouchersPerCampaign as jest.Mock).mockResolvedValueOnce({
        results: vouchers,
        total: 2,
      });
      req.params = { campaignId: campaign.id };

      await voucherController.listVouchersPerCampaign(req, mockResponse, mockNext);

      expect(mockResponse.set).toHaveBeenCalledWith('X-Total-Count', '2');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });
  });

  describe('downloadVouchersAsCsv()', () => {
    let req: VoucherListPerCampaignRequest;

    beforeEach(() => {
      req = { query: {}, params: {} } as VoucherListPerCampaignRequest;
    });

    describe('when there is no campaign', () => {
      it('should return response with status code 404', async () => {
        (aCampaignService.findById as jest.Mock).mockResolvedValueOnce(null);
        await voucherController.downloadVouchersAsCsv(req, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
      });
    });

    describe('when there are no vouchers for campaign', () => {
      it('should return response with status code 404', async () => {
        const campaign = aCampaign({}).buildMock();
        (aCampaignService.findById as jest.Mock).mockResolvedValueOnce(campaign);
        (aVoucherService.listVouchersPerCampaign as jest.Mock).mockResolvedValueOnce({
          results: [],
          total: 0,
        });
        await voucherController.downloadVouchersAsCsv(req, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
      });
    });

    describe('when there are voucher', () => {
      describe('when vouchers total count is less than export csv page size', () => {
        it('should send file at once', async () => {
          const campaign = aCampaign({}).buildMock();
          const vouchers = [aVoucher({ campaignId: campaign.id }).buildMock(), aVoucher({ campaignId: campaign.id }).buildMock()];

          (aCampaignService.findById as jest.Mock).mockResolvedValueOnce(campaign);
          (aVoucherService.listVouchersPerCampaign as jest.Mock)
            .mockResolvedValueOnce({
              results: vouchers,
              total: 2,
            })
            .mockResolvedValueOnce({
              results: [],
              total: 0,
            });

          req.params = { campaignId: campaign.id };

          await voucherController.downloadVouchersAsCsv(req, mockResponse, mockNext);

          expect(mockResponse.set).toHaveBeenCalledWith('Content-Type', 'text/csv');
          expect(mockResponse.set).toHaveBeenCalledWith('Content-Disposition', `attachment; filename=vouchers-${campaign.id}.csv`);
          expect(mockResponse.write).toHaveBeenCalledTimes(1);
          expect(mockResponse.status).toHaveBeenCalledWith(200);
          expect(mockResponse.end).toHaveBeenCalledTimes(1);
        });
      });

      describe('when vouchers total count is more than export csv page size', () => {
        it('should write response several times and stream file partially to the client', async () => {
          const campaign = aCampaign({}).buildMock();
          const vouchersPage1 = [aVoucher({ campaignId: campaign.id }).buildMock(), aVoucher({ campaignId: campaign.id }).buildMock()];
          const vouchersPage2 = [aVoucher({ campaignId: campaign.id }).buildMock(), aVoucher({ campaignId: campaign.id }).buildMock()];

          (aCampaignService.findById as jest.Mock).mockResolvedValueOnce(campaign);
          (aVoucherService.listVouchersPerCampaign as jest.Mock)
            .mockResolvedValueOnce({
              results: vouchersPage1,
              total: 2,
            })
            .mockResolvedValueOnce({
              results: vouchersPage2,
              total: 2,
            })
            .mockResolvedValueOnce({
              results: [],
              total: 0,
            });

          req.params = { campaignId: campaign.id };

          await voucherController.downloadVouchersAsCsv(req, mockResponse, mockNext);

          expect(mockResponse.set).toHaveBeenCalledWith('Content-Type', 'text/csv');
          expect(mockResponse.set).toHaveBeenCalledWith('Content-Disposition', `attachment; filename=vouchers-${campaign.id}.csv`);
          expect(mockResponse.write).toHaveBeenCalledTimes(2);
          expect(mockResponse.status).toHaveBeenCalledWith(200);
          expect(mockResponse.end).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
