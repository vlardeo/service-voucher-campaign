import pool from '../../../src/drivers/postgresql';
import flush from '../../flush';
import request from 'supertest';
import server from '../../../src/server';
import { CampaignCurrency } from '../../../src/interfaces/domain/campaign.types';
import pgCampaignRepository from '../../../src/repositories/campaign.repository';
import { aCampaign } from '../../builders/campaign.builder';

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
            pageSize: 1,
            page: 1,
          };

          await aCampaign({}).build();
          const campaign = await aCampaign({}).build();

          const { status, body, headers } = await request(server).get('/campaigns').query(QUERY);

          expect(headers['x-total-count']).toBe('2');
          expect(status).toBe(200);
          expect(body).toEqual(expect.arrayContaining([expect.objectContaining({ id: campaign.id })]));
        });
      });
    });
  });
});
