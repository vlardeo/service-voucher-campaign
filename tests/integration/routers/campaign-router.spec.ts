import pool from '@/drivers/postgresql';
import flush from '@tests/flush';
import request from 'supertest';
import server from '@/server';
import { CampaignCurrency } from '@/interfaces/domain/campaign.types';
import pgCampaignRepository from '@/repositories/campaign.repository';
import { aCampaign } from '@tests/builders/campaign.builder';
import { generateUuid } from '@tests/uuid';
import pgVoucherRepository from '@/repositories/voucher.repository';
import { aVoucher } from '@tests/builders/voucher.builder';

describe('@routers/campaign-router', () => {
  afterEach(async () => {
    await flush(pool);
  });

  describe('POST /campaigns', () => {
    describe('when payload is not valid', () => {
      describe('when payload schema types is not valid', () => {
        it('should return status code 400', async () => {
          // Amount should be above 0
          const REQUEST = {
            prefix: '1',
            fromDate: '2022-01-01T00:00:00Z',
            toDate: '2022-01-02T00:00:00Z',
            amount: -1,
            currency: CampaignCurrency.EUR,
          };

          const response = await request(server).post('/campaigns').send(REQUEST);

          expect(response.status).toBe(400);
        });
      });

      describe("when campaign's start date comes after its end date", () => {
        it('should return status code 400', async () => {
          const REQUEST = {
            prefix: '1',
            fromDate: '2022-01-02T00:00:00Z',
            toDate: '2022-01-01T00:00:00Z',
            amount: 10,
            currency: CampaignCurrency.EUR,
          };

          const response = await request(server).post('/campaigns').send(REQUEST);

          expect(response.status).toBe(400);
        });
      });

      describe("when campaign's start date equals to its end date", () => {
        it('should return status code 400', async () => {
          const REQUEST = {
            prefix: '1',
            fromDate: '2022-01-01T00:00:00Z',
            toDate: '2022-01-01T00:00:00Z',
            amount: 10,
            currency: CampaignCurrency.EUR,
          };

          const response = await request(server).post('/campaigns').send(REQUEST);

          expect(response.status).toBe(400);
        });
      });
    });

    describe('when payload schema is valid', () => {
      it('should create entity and return it with status code 201', async () => {
        const REQUEST = {
          prefix: '1',
          fromDate: '2022-01-01T00:00:00Z',
          toDate: '2022-01-02T00:00:00Z',
          amount: 10,
          currency: CampaignCurrency.EUR,
        };

        const { status, body } = await request(server).post('/campaigns').send(REQUEST);

        expect(status).toBe(201);
        expect(body).toEqual(
          expect.objectContaining({
            prefix: REQUEST.prefix,
            amount: REQUEST.amount,
            currency: REQUEST.currency,
          }),
        );

        await expect(pgCampaignRepository.findById(body.id)).resolves.toBeDefined();
      });
    });
  });

  describe('GET /campaigns', () => {
    describe('when payload is not valid', () => {
      it('should return status code 400', async () => {
        // Page size should be above 0
        const QUERY = {
          pageSize: 0,
        };

        const response = await request(server).get('/campaigns').query(QUERY);

        expect(response.status).toBe(400);
      });
    });

    describe('when payload schema is valid', () => {
      it('should list entities, return total count header and status code 200', async () => {
        const allCampaigns = await Promise.all([aCampaign({}).build(), aCampaign({}).build()]);

        const { status, body, headers } = await request(server).get('/campaigns');

        expect(headers['x-total-count']).toBe('2');
        expect(status).toBe(200);
        expect(body).toEqual(
          expect.arrayContaining([expect.objectContaining({ id: allCampaigns[0].id }), expect.objectContaining({ id: allCampaigns[1].id })]),
        );
      });

      describe('when query passed', () => {
        it('should paginate and return list entities, total count header and status code 200', async () => {
          const QUERY = {
            pageSize: 2,
            page: 1,
          };

          await aCampaign({}).build();
          await aCampaign({}).build();
          const campaign1 = await aCampaign({}).build();
          const campaign2 = await aCampaign({}).build();

          const { status, body, headers } = await request(server).get('/campaigns').query(QUERY);

          expect(headers['x-total-count']).toBe('4');
          expect(status).toBe(200);
          expect(body).toEqual(
            expect.arrayContaining([expect.objectContaining({ id: campaign1.id }), expect.objectContaining({ id: campaign2.id })]),
          );
        });
      });
    });
  });

  describe('POST /campaigns/:campaignId/vouchers/batch', () => {
    describe('when payload schema is not valid', () => {
      it('should return status code 400', async () => {
        const CAMPAIGN_ID = generateUuid();
        const response = await request(server).post(`/campaigns/${CAMPAIGN_ID}/vouchers/batch`).query({ amount: 'A' });
        expect(response.status).toBe(400);
      });
    });

    describe('when payload schema is valid', () => {
      describe('when campaign is not exist', () => {
        it('should return status code 404', async () => {
          const CAMPAIGN_ID = generateUuid();
          const response = await request(server).post(`/campaigns/${CAMPAIGN_ID}/vouchers/batch`).query({ amount: 10 });
          expect(response.status).toBe(404);
        });
      });

      describe('when campaign is exist', () => {
        it('should create vouchers and return number of create vouchers with status code 201', async () => {
          const campaign = await aCampaign({}).build();

          const response = await request(server).post(`/campaigns/${campaign.id}/vouchers/batch`).query({ amount: 10 });
          expect(response.status).toBe(201);
          expect(response.body).toEqual({ created: 10 });

          const { results: createdVouchers } = await pgVoucherRepository.listVouchersPerCampaign({ campaignId: campaign.id });
          expect(createdVouchers).toHaveLength(10);
          createdVouchers.map(({ campaignId }) => expect(campaignId).toEqual(campaign.id));
        });
      });
    });
  });

  describe('GET /campaigns/:campaignId/vouchers', () => {
    describe('when payload is not valid', () => {
      it('should return status code 400', async () => {
        // Page size should be above 0
        const QUERY = {
          pageSize: 0,
        };

        const response = await request(server).get(`/campaigns/${generateUuid()}/vouchers`).query(QUERY);

        expect(response.status).toBe(400);
      });
    });

    describe('when payload schema is valid', () => {
      it('should list entities, return total count header and status code 200', async () => {
        const campaign1 = await aCampaign({}).build();
        const campaign1Vouchers = await Promise.all([aVoucher({ campaignId: campaign1.id }).build(), aVoucher({ campaignId: campaign1.id }).build()]);

        const campaign2 = await aCampaign({}).build();
        await Promise.all([aVoucher({ campaignId: campaign2.id }).build(), aVoucher({ campaignId: campaign2.id }).build()]);

        const { status, body, headers } = await request(server).get(`/campaigns/${campaign1.id}/vouchers`);

        expect(headers['x-total-count']).toBe('2');
        expect(status).toBe(200);
        expect(body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: campaign1Vouchers[0].id }),
            expect.objectContaining({ id: campaign1Vouchers[1].id }),
          ]),
        );
      });

      describe('when query passed', () => {
        it('should paginate and return list entities, total count header and status code 200', async () => {
          const QUERY = {
            pageSize: 2,
            page: 1,
          };

          const campaign = await aCampaign({}).build();

          await aVoucher({ campaignId: campaign.id }).build();
          await aVoucher({ campaignId: campaign.id }).build();
          const voucher1 = await aVoucher({ campaignId: campaign.id }).build();
          const voucher2 = await aVoucher({ campaignId: campaign.id }).build();
          await aVoucher({ campaignId: campaign.id }).build();

          const { status, body, headers } = await request(server).get(`/campaigns/${campaign.id}/vouchers`).query(QUERY);

          expect(headers['x-total-count']).toBe('5');
          expect(status).toBe(200);
          expect(body).toEqual(expect.arrayContaining([expect.objectContaining({ id: voucher1.id }), expect.objectContaining({ id: voucher2.id })]));
        });
      });
    });
  });

  describe('DELETE /campaigns/:campaignId', () => {
    it('should delete vouchers and campaign, return number of deleted and status code 200', async () => {
      const campaign = await aCampaign({}).build();
      await Promise.all([aVoucher({ campaignId: campaign.id }).build(), aVoucher({ campaignId: campaign.id }).build()]);

      const { status, body } = await request(server).delete(`/campaigns/${campaign.id}`);

      expect(status).toBe(200);
      expect(body).toEqual({ deleted: 1 });

      const campaignDb = await pgCampaignRepository.findById(campaign.id);
      expect(campaignDb).toBe(null);

      const { total, results } = await pgVoucherRepository.listVouchersPerCampaign({ campaignId: campaign.id });
      expect(results).toHaveLength(0);
      expect(total).toBe(0);
    });
  });
});
