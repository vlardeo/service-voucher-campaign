import aCampaignService from '@tests/mocks/campaign.service';
jest.mock('@/services/campaign.service', () => aCampaignService);

import aVoucherService from '@tests/mocks/voucher.service';
jest.mock('@/services/voucher.service', () => aVoucherService);

import type { Request } from 'express';
import campaignController, {
  CampaignDeleteRequest,
  VoucherBatchCreateRequest,
  VoucherListPerCampaignRequest,
} from '@/controllers/campaign.controller';
import { aCampaign } from '@tests/builders/campaign.builder';
import { mockNext, mockResponse } from '@tests/mocks/express-api';
import { generateUuid } from '@tests/uuid';
import { aVoucher } from '@tests/builders/voucher.builder';

describe('@controllers/campaign-controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    let req: Request;

    beforeEach(() => {
      req = { query: {}, body: {}, params: {} } as Request;
    });

    describe("when campaign's start date comes after its end date", () => {
      it('should send response once with status code 400', async () => {
        const campaign = aCampaign({}).buildMock();
        const FROM_DATE = new Date('2023').toISOString();
        const TO_DATE = new Date('2022').toISOString();

        req.body = {
          prefix: campaign.prefix,
          fromDate: FROM_DATE,
          toDate: TO_DATE,
          amount: campaign.amount,
          currency: campaign.currency,
        };

        await campaignController.create(req, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledTimes(1);
      });
    });

    describe("when campaign's start date equals to its end date", () => {
      it('should send response once with status code 400', async () => {
        const campaign = aCampaign({}).buildMock();
        const DATE = new Date('2023').toISOString();

        req.body = {
          prefix: campaign.prefix,
          fromDate: DATE,
          toDate: DATE,
          amount: campaign.amount,
          currency: campaign.currency,
        };

        await campaignController.create(req, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledTimes(1);
      });
    });

    describe('when payload is valid', () => {
      it('should send response with created campaign and status code 201', async () => {
        const campaign = aCampaign({}).buildMock();
        (aCampaignService.create as jest.Mock).mockResolvedValueOnce(campaign);

        req.body = {
          prefix: campaign.prefix,
          fromDate: campaign.fromDate,
          toDate: campaign.toDate,
          amount: campaign.amount,
          currency: campaign.currency,
        };

        await campaignController.create(req, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith(campaign);
      });
    });
  });

  describe('list()', () => {
    let req: Request;

    beforeEach(() => {
      req = { query: {}, body: {}, params: {} } as Request;
    });

    it('should send response with array of results, total count header and status code 200', async () => {
      const campaigns = [aCampaign({}).buildMock(), aCampaign({}).buildMock()];
      (aCampaignService.list as jest.Mock).mockResolvedValueOnce({
        results: campaigns,
        total: 2,
      });

      await campaignController.list(req, mockResponse, mockNext);
      expect(mockResponse.set).toHaveBeenCalledWith('X-Total-Count', '2');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });
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

        await campaignController.voucherBatchCreate(req, mockResponse, mockNext);
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

      await campaignController.listVouchersPerCampaign(req, mockResponse, mockNext);

      expect(mockResponse.set).toHaveBeenCalledWith('X-Total-Count', '2');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete()', () => {
    let req: CampaignDeleteRequest;

    beforeEach(() => {
      req = { params: {} } as CampaignDeleteRequest;
    });

    it('should send response with status code 200 and number of deleted campaign', async () => {
      (aCampaignService.delete as jest.Mock).mockResolvedValueOnce({ deleted: 1 });
      req.params = { campaignId: generateUuid() };

      await campaignController.delete(req, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });
  });
});
