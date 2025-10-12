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
        accounts ? { accounts } : undefined
      );
      return (
        result ?? {
          accounts: {},
          total_balance: 0,
          total_pnl: 0,
          total_pnl_percentage: 0,
          timestamp: new Date().toISOString(),
        }
      );
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
      return result ?? { data: [] };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes for historical data
    enabled: !!filters, // Only run if filters are provided
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
          tokens: {},
          total_value: 0,
          timestamp: new Date().toISOString(),
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
          timestamp: new Date().toISOString(),
        }
      );
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
}
