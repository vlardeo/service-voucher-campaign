import request from 'supertest';
import pool from '@/drivers/postgresql';
import pgVoucherRepository from '@/repositories/voucher.repository';
import server from '@/server';
import { aCampaign } from '@tests/builders/campaign.builder';
import flush from '@tests/flush';
import { generateUuid } from '@tests/uuid';
import { aVoucher } from '@tests/builders/voucher.builder';
import Papa from 'papaparse';

describe('@routers/voucher-router', () => {
  afterEach(async () => {
    await flush(pool);
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

  describe('GET /campaigns/:campaignId/vouchers/download/csv', () => {
    describe('when there is no campaign', () => {
      it('should return status code 404', async () => {
        const { status } = await request(server).get(`/campaigns/${generateUuid()}/vouchers/download/csv`);
        expect(status).toBe(404);
      });
    });

    describe('when there are no vouchers', () => {
      it('should return status code 404', async () => {
        const campaign = await aCampaign({}).build();
        const { status } = await request(server).get(`/campaigns/${campaign.id}/vouchers/download/csv`);
        expect(status).toBe(404);
      });
    });

    describe('when there are vouchers', () => {
      it('should return correct CSV file response', async () => {
        const campaign = await aCampaign({}).build();
        const voucher1 = await aVoucher({ campaignId: campaign.id }).build();
        const voucher2 = await aVoucher({ campaignId: campaign.id }).build();

        const response = await request(server)
          .get(`/campaigns/${campaign.id}/vouchers/download/csv`)
          .buffer()
          .parse((res: any, callback) => {
            res.setEncoding('binary');
            res.data = '';
            res.on('data', (chunk: string) => {
              res.data += chunk;
            });
            res.on('end', () => {
              callback(null, Buffer.from(res.data, 'binary'));
            });
          });

        const { statusCode, headers } = response;

        expect(statusCode).toBe(200);
        expect(headers['content-disposition']).toBe(`attachment; filename=vouchers-${campaign.id}.csv`);
        expect(headers['content-type']).toBe('text/csv; charset=utf-8');
        expect(headers['content-length']).not.toBe('0');

        // Validate downloaded content
        const { data }: { data: string[][] } = Papa.parse(response.body.toString());
        expect(data).toHaveLength(3);
        expect(data[1][0]).toBe(voucher1.id);
        expect(data[2][0]).toBe(voucher2.id);
      });
    });
  });
});
