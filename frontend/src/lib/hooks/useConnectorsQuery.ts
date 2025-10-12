import { useQuery } from '@tanstack/react-query';
import { connectorsApi } from '@/lib/api/connectors';

// Query Keys
export const connectorsQueryKeys = {
  all: ['connectors'] as const,
  lists: () => [...connectorsQueryKeys.all, 'list'] as const,
  list: (filters?: string) =>
    [...connectorsQueryKeys.lists(), filters] as const,
  details: () => [...connectorsQueryKeys.all, 'detail'] as const,
  detail: (connectorName: string) =>
    [...connectorsQueryKeys.details(), connectorName] as const,
  configMap: (connectorName: string) =>
    [...connectorsQueryKeys.all, 'config-map', connectorName] as const,
  tradingRules: (connectorName: string, tradingPairs?: string[]) =>
    [
      ...connectorsQueryKeys.all,
      'trading-rules',
      connectorName,
      tradingPairs,
    ] as const,
  orderTypes: (connectorName: string) =>
    [...connectorsQueryKeys.all, 'order-types', connectorName] as const,
};

// Connectors Hooks
export function useAvailableConnectors() {
  return useQuery({
    queryKey: connectorsQueryKeys.lists(),
    queryFn: async () => {
      const result = await connectorsApi.getAvailableConnectors();
      // Ensure we never return undefined - React Query requires this
      return result ?? [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes (connectors don't change often)
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    throwOnError: false, // Don't throw errors, return error state instead
  });
}

export function useConnectorConfigMap(connectorName: string, enabled = true) {
  return useQuery({
    queryKey: connectorsQueryKeys.configMap(connectorName),
    queryFn: async () => {
      const result = await connectorsApi.getConnectorConfigMap(connectorName);
      return result ?? [];
    },
    enabled: enabled && !!connectorName,
    staleTime: 1000 * 60 * 15, // 15 minutes (config maps are fairly static)
  });
}

export function useTradingRules(
  connectorName: string,
  tradingPairs?: string[],
  enabled = true
) {
  return useQuery({
    queryKey: connectorsQueryKeys.tradingRules(connectorName, tradingPairs),
    queryFn: async () => {
      const result = await connectorsApi.getTradingRules(
        connectorName,
        tradingPairs
      );
      return result ?? {};
    },
    enabled: enabled && !!connectorName,
    staleTime: 1000 * 60 * 5, // 5 minutes (trading rules can change)
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
}

export function useSupportedOrderTypes(connectorName: string, enabled = true) {
  return useQuery({
    queryKey: connectorsQueryKeys.orderTypes(connectorName),
    queryFn: async () => {
      const result = await connectorsApi.getSupportedOrderTypes(connectorName);
      return result ?? [];
    },
    enabled: enabled && !!connectorName,
    staleTime: 1000 * 60 * 15, // 15 minutes (order types are fairly static)
  });
}
