import { useQuery, useMutation } from '@tanstack/react-query';
import { marketDataApi, CandlesRequest, HistoricalCandlesRequest } from '@/lib/api/market-data';
import { connectorsApi } from '@/lib/api/connectors';

// Query Keys
export const marketDataQueryKeys = {
  all: ['marketData'] as const,
  candles: (params: CandlesRequest) =>
    [...marketDataQueryKeys.all, 'candles', params] as const,
  historicalCandles: (params: HistoricalCandlesRequest) =>
    [...marketDataQueryKeys.all, 'historicalCandles', params] as const,
  connectors: () => [...marketDataQueryKeys.all, 'connectors'] as const,
  tradingRules: (connector: string) => 
    [...marketDataQueryKeys.all, 'tradingRules', connector] as const,
};

// Market Data Hooks
export function useAvailableMarketDataConnectors() {
  return useQuery({
    queryKey: marketDataQueryKeys.connectors(),
    queryFn: async () => {
      const result = await marketDataApi.getAvailableMarketDataConnectors();
      return result.data ?? [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes (connectors don't change often)
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    throwOnError: false, // Don't throw errors, return error state instead
  });
}

// Hook to get available connectors
export function useAvailableConnectors() {
  return useQuery({
    queryKey: ['connectors', 'available'],
    queryFn: () => connectorsApi.getAvailableConnectors(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30,
    throwOnError: false,
  });
}

// Hook to get trading rules (trading pairs) for a connector
export function useTradingRules(connector: string, enabled = true) {
  return useQuery({
    queryKey: marketDataQueryKeys.tradingRules(connector),
    queryFn: () => connectorsApi.getTradingRules(connector),
    enabled: enabled && !!connector,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15,
    throwOnError: false,
  });
}

export function useCandles(params: CandlesRequest, enabled = true) {
  return useQuery({
    queryKey: marketDataQueryKeys.candles(params),
    queryFn: async () => {
      const result = await marketDataApi.getCandles(params);
      return (
        result.data ?? {
          candles: [],
          symbol: params.trading_pair,
          interval: params.interval,
          connector: params.connector,
        }
      );
    },
    enabled: enabled && !!params.connector && !!params.trading_pair,
    staleTime: 1000 * 30, // 30 seconds for real-time data
    refetchInterval: 1000 * 60, // Refetch every minute for live updates
    throwOnError: false,
  });
}

// Manual fetch candles mutation for on-demand loading
export function useFetchCandles() {
  return useMutation({
    mutationFn: (params: CandlesRequest) => marketDataApi.getCandles(params),
  });
}

// Manual fetch historical candles mutation
export function useFetchHistoricalCandles() {
  return useMutation({
    mutationFn: (params: HistoricalCandlesRequest) => 
      marketDataApi.getHistoricalCandles(params),
  });
}
