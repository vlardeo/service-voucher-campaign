export enum CampaignCurrency {
  EUR = 'EUR',
  USD = 'USD',
}

export type Campaign = {
  id: string;
  prefix: string;
  fromDate: Date;
  toDate: Date;
  amount: number;
  currency: CampaignCurrency;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCampaignDto = {
  prefix: string;
  fromDate: string;
  toDate: string;
  amount: number;
  currency: CampaignCurrency;
};
