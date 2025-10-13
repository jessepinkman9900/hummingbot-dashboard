import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi, portfolioApi } from '@/lib/api/accounts';
import { toast } from 'sonner';

// Query Keys
export const accountsQueryKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountsQueryKeys.all, 'list'] as const,
  list: (filters?: string) => [...accountsQueryKeys.lists(), filters] as const,
  details: () => [...accountsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...accountsQueryKeys.details(), id] as const,
  credentials: (accountName: string) =>
    [...accountsQueryKeys.all, 'credentials', accountName] as const,
};

export const portfolioQueryKeys = {
  all: ['portfolio'] as const,
  state: (accounts?: string[]) =>
    [...portfolioQueryKeys.all, 'state', accounts] as const,
  history: (filters?: any) =>
    [...portfolioQueryKeys.all, 'history', filters] as const,
  distribution: (accounts?: string[]) =>
    [...portfolioQueryKeys.all, 'distribution', accounts] as const,
  accountsDistribution: (accounts?: string[]) =>
    [...portfolioQueryKeys.all, 'accounts-distribution', accounts] as const,
};

// Accounts Hooks
export function useAccounts() {
  return useQuery({
    queryKey: accountsQueryKeys.lists(),
    queryFn: async () => {
      const result = await accountsApi.listAccounts();
      // Ensure we never return undefined - React Query requires this
      return result ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    throwOnError: false, // Don't throw errors, return error state instead
  });
}

export function useAccountCredentials(accountName: string, enabled = true) {
  return useQuery({
    queryKey: accountsQueryKeys.credentials(accountName),
    queryFn: async () => {
      const result = await accountsApi.getAccountCredentials(accountName);
      return result ?? [];
    },
    enabled: enabled && !!accountName,
    staleTime: 1000 * 60 * 10, // 10 minutes (credentials don't change often)
  });
}

// Account Mutations
export function useAddAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountName: string) => accountsApi.addAccount(accountName),
    onSuccess: (data, accountName) => {
      // Invalidate and refetch accounts list
      queryClient.invalidateQueries({ queryKey: accountsQueryKeys.lists() });
      toast.success(`Account "${accountName}" added successfully`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to add account'
      );
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountName: string) => accountsApi.deleteAccount(accountName),
    onSuccess: (data, accountName) => {
      // Invalidate and refetch accounts list
      queryClient.invalidateQueries({ queryKey: accountsQueryKeys.lists() });
      // Remove specific account credentials from cache
      queryClient.removeQueries({
        queryKey: accountsQueryKeys.credentials(accountName),
      });
      toast.success(`Account "${accountName}" deleted successfully`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete account'
      );
    },
  });
}

export function useAddCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountName,
      connectorName,
      credentials,
    }: {
      accountName: string;
      connectorName: string;
      credentials: Record<string, string>;
    }) => accountsApi.addCredential(accountName, connectorName, credentials),
    onSuccess: (data, { accountName, connectorName }) => {
      // Invalidate account credentials
      queryClient.invalidateQueries({
        queryKey: accountsQueryKeys.credentials(accountName),
      });
      toast.success(`Credentials for ${connectorName} added successfully`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to add credentials'
      );
    },
  });
}

export function useDeleteCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountName,
      connectorName,
    }: {
      accountName: string;
      connectorName: string;
    }) => accountsApi.deleteCredential(accountName, connectorName),
    onSuccess: (data, { accountName, connectorName }) => {
      // Invalidate account credentials
      queryClient.invalidateQueries({
        queryKey: accountsQueryKeys.credentials(accountName),
      });
      toast.success(`Credentials for ${connectorName} deleted successfully`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete credentials'
      );
    },
  });
}

// Portfolio Hooks
export function usePortfolioState(accounts?: string[]) {
  return useQuery({
    queryKey: portfolioQueryKeys.state(accounts),
    queryFn: async () => {
      const result = await portfolioApi.getPortfolioState(
        accounts && accounts.length > 0 ? { accounts } : undefined
      );

      if (!result) {
        return {
          accounts: {},
          total_balance: 0,
          total_pnl: 0,
          total_pnl_percentage: 0,
          timestamp: new Date().toISOString(),
        };
      }

      // Transform the API response format: { account_name: { connector_name: [token_data] } }
      // into the expected format with totals
      let totalBalance = 0;
      const transformedAccounts: Record<string, any> = {};

      Object.entries(result).forEach(
        ([accountName, connectors]: [string, any]) => {
          let accountBalance = 0;
          const accountConnectors: Record<string, any> = {};

          Object.entries(connectors).forEach(
            ([connectorName, tokens]: [string, any]) => {
              let connectorBalance = 0;
              const connectorTokens: Record<string, any> = {};

              if (Array.isArray(tokens)) {
                tokens.forEach((token: any) => {
                  const tokenValue = token.value || 0;
                  connectorBalance += tokenValue;
                  connectorTokens[token.token] = {
                    units: token.units || 0,
                    price: token.price || 0,
                    value: tokenValue,
                    available_units: token.available_units || 0,
                  };
                });
              }

              accountBalance += connectorBalance;
              accountConnectors[connectorName] = {
                total_balance: connectorBalance,
                tokens: connectorTokens,
              };
            }
          );

          totalBalance += accountBalance;
          transformedAccounts[accountName] = {
            total_balance: accountBalance,
            total_pnl: 0, // PnL calculation would need historical data
            total_pnl_percentage: 0,
            connectors: accountConnectors,
          };
        }
      );

      return {
        accounts: transformedAccounts,
        total_balance: totalBalance,
        total_pnl: 0,
        total_pnl_percentage: 0,
        timestamp: new Date().toISOString(),
      };
    },
    staleTime: 1000 * 30, // 30 seconds for portfolio data
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

export function usePortfolioHistory(filters?: any) {
  return useQuery({
    queryKey: portfolioQueryKeys.history(filters),
    queryFn: async () => {
      const result = await portfolioApi.getPortfolioHistory(filters);

      if (!result || !result.data) {
        return {
          data: [],
          chartData: [],
          pagination: {
            limit: 100,
            has_more: false,
            next_cursor: null,
            current_cursor: 'string',
            filters: {
              account_names: [],
              connector_names: [],
              start_time: 0,
              end_time: 0,
            },
          },
        };
      }

      // Transform the API response data into chart-friendly format
      const chartData = result.data
        .map((dataPoint: any) => {
          let totalValue = 0;

          // Calculate total value across all accounts and connectors
          Object.values(dataPoint.state).forEach((accountData: any) => {
            Object.values(accountData).forEach((connectorTokens: any) => {
              if (Array.isArray(connectorTokens)) {
                connectorTokens.forEach((token: any) => {
                  totalValue += token.value || 0;
                });
              }
            });
          });

          return {
            timestamp: new Date(dataPoint.timestamp),
            totalBalance: totalValue,
            totalPnL: 0, // Would need baseline to calculate PnL
            totalPnLPercentage: 0,
          };
        })
        .sort(
          (a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime()
        );

      return {
        data: result.data,
        chartData,
        pagination: result.pagination,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes for historical data
    enabled: true, // Always enabled now, will use default accounts/connectors
  });
}

export function usePortfolioDistribution(accounts?: string[]) {
  return useQuery({
    queryKey: portfolioQueryKeys.distribution(accounts),
    queryFn: async () => {
      const result = await portfolioApi.getPortfolioDistribution(
        accounts ? { accounts } : undefined
      );
      return (
        result ?? {
          total_portfolio_value: 0,
          token_count: 0,
          distribution: [],
          account_filter: undefined,
        }
      );
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
}

export function useAccountsDistribution(accounts?: string[]) {
  return useQuery({
    queryKey: portfolioQueryKeys.accountsDistribution(accounts),
    queryFn: async () => {
      const result = await portfolioApi.getAccountsDistribution(
        accounts ? { accounts } : undefined
      );
      return (
        result ?? {
          accounts: {},
          total_value: 0,
          account_count: 0,
        }
      );
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
}
