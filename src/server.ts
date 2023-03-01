import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(helmet());
server.use(cors());

export default server;
