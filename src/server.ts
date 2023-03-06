import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import campaignRouter from '@/routers/campaign.router';

const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(helmet());
server.use(cors());

server.use('/campaigns', campaignRouter());

export default server;
