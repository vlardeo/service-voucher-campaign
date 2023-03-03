import type { Request, Response, NextFunction } from 'express';

const mockRequest = {} as Request;
const mockResponse = {
  send: jest.fn(() => mockResponse),
  json: jest.fn(() => mockResponse),
  status: jest.fn(() => mockResponse),
  set: jest.fn(() => mockResponse),
} as unknown as Response;
const mockNext = jest.fn() as NextFunction;

export { mockRequest, mockResponse, mockNext };
