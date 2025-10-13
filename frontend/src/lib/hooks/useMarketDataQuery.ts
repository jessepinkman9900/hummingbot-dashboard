import { useQuery, useMutation } from '@tanstack/react-query';
import { marketDataApi, CandlesRequest } from '@/lib/api/market-data';

// Query Keys
export const marketDataQueryKeys = {
  all: ['marketData'] as const,
  candles: (params: CandlesRequest) =>
    [...marketDataQueryKeys.all, 'candles', params] as const,
  connectors: () => [...marketDataQueryKeys.all, 'connectors'] as const,
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
