import { apiClient } from './client';
import { ApiResponse } from '@/lib/types';

// Market Data Types for Lightweight Charts
export interface CandleData {
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface CandlesRequest {
  connector: string;
  trading_pair: string;
  interval: string;
  max_records: number;
}

export interface CandlesResponse {
  candles: CandleData[];
  symbol: string;
  interval: string;
  connector: string;
}

export interface MarketDataApiClient {
  getCandles: (
    request: CandlesRequest
  ) => Promise<ApiResponse<CandlesResponse>>;
  getAvailableConnectors: () => Promise<ApiResponse<string[]>>;
}

export const marketDataApi: MarketDataApiClient = {
  async getCandles(
    request: CandlesRequest
  ): Promise<ApiResponse<CandlesResponse>> {
    return apiClient.post<CandlesResponse>('/market-data/candles', {
      connector: request.connector,
      trading_pair: request.trading_pair,
      interval: request.interval,
      max_records: request.max_records,
    });
  },

  async getAvailableConnectors(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/connectors');
  },
};
