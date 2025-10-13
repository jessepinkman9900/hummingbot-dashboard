import { apiClient } from './client';
import { ApiResponse } from '@/lib/types';

// Market Data Types for Lightweight Charts
export interface CandleData {
  timestamp: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  quote_asset_volume?: number;
  n_trades?: number;
  taker_buy_base_volume?: number;
  taker_buy_quote_volume?: number;
}

export interface HistoricalCandlesRequest {
  connector_name: string;
  trading_pair: string;
  interval: string;
  start_time: number; // Unix timestamp
  end_time: number; // Unix timestamp
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
  getHistoricalCandles: (
    request: HistoricalCandlesRequest
  ) => Promise<ApiResponse<CandleData[]>>;
  getAvailableMarketDataConnectors: () => Promise<ApiResponse<string[]>>;
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

  async getHistoricalCandles(
    request: HistoricalCandlesRequest
  ): Promise<ApiResponse<CandleData[]>> {
    return apiClient.post<CandleData[]>('/market-data/historical-candles', {
      connector_name: request.connector_name,
      trading_pair: request.trading_pair,
      interval: request.interval,
      start_time: request.start_time,
      end_time: request.end_time,
    });
  },

  async getAvailableMarketDataConnectors(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/market-data/available-candle-connectors');
  },
};
