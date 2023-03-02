import aCampaignService from '../../mocks/campaign.service';
jest.mock('../../../src/services/campaign.service', () => aCampaignService);

import type { Request } from 'express';
import campaignController from '../../../src/controllers/campaign.controller';
import { aCampaign } from '../../builders/campaign.builder';
import { mockNext, mockResponse } from '../../mocks/express-api';

describe('@controllers/campaign-controller', () => {
  let req: Request;

  beforeEach(() => {
    req = {} as Request;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    describe("when campaign's start date comes after its end date", () => {
      it('should send response once with status code 400', async () => {
        const campaign = aCampaign({}).buildMock();
        const FROM_DATE = new Date('2023').toISOString();
        const TO_DATE = new Date('2022').toISOString();

        req = {
          body: {
            prefix: campaign.prefix,
            fromDate: FROM_DATE,
            toDate: TO_DATE,
            amount: campaign.amount,
            currency: campaign.currency,
          },
        } as Request;

        await campaignController.create(req, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledTimes(1);
      });
    });

    describe("when campaign's start date equals to its end date", () => {
      it('should send response once with status code 400', async () => {
        const campaign = aCampaign({}).buildMock();
        const DATE = new Date('2023').toISOString();

        req = {
          body: {
            prefix: campaign.prefix,
            fromDate: DATE,
            toDate: DATE,
            amount: campaign.amount,
            currency: campaign.currency,
          },
        } as Request;

        await campaignController.create(req, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledTimes(1);
      });
    });

    describe('when payload is valid', () => {
      it('should send response with created campaign and status code 201', async () => {
        const campaign = aCampaign({}).buildMock();
        (aCampaignService.create as jest.Mock).mockResolvedValueOnce(campaign);

        req = {
          body: {
            prefix: campaign.prefix,
            fromDate: campaign.fromDate,
            toDate: campaign.toDate,
            amount: campaign.amount,
            currency: campaign.currency,
          },
        } as Request;

        await campaignController.create(req, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith(campaign);
      });
    });
  });

  describe('list()', () => {
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
});
