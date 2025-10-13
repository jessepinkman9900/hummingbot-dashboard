import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

/**
 * Global refresh hook that provides functionality to refresh all queries
 * or specific query categories across the entire application
 */
export function useGlobalRefresh() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Invalidate all queries to trigger a refetch
      await queryClient.invalidateQueries();
      toast.success('All data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  const refreshAccounts = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Accounts data refreshed');
    } catch (error) {
      console.error('Failed to refresh accounts:', error);
      toast.error('Failed to refresh accounts');
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  const refreshPortfolio = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      toast.success('Portfolio data refreshed');
    } catch (error) {
      console.error('Failed to refresh portfolio:', error);
      toast.error('Failed to refresh portfolio');
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  const refreshBots = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['bots'] });
      toast.success('Bots data refreshed');
    } catch (error) {
      console.error('Failed to refresh bots:', error);
      toast.error('Failed to refresh bots');
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  const refreshConnectors = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['connectors'] });
      toast.success('Connectors data refreshed');
    } catch (error) {
      console.error('Failed to refresh connectors:', error);
      toast.error('Failed to refresh connectors');
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  const refreshMarket = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['market'] });
      toast.success('Market data refreshed');
    } catch (error) {
      console.error('Failed to refresh market data:', error);
      toast.error('Failed to refresh market data');
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return {
    refreshAll,
    refreshAccounts,
    refreshPortfolio,
    refreshBots,
    refreshConnectors,
    refreshMarket,
    isRefreshing,
  };
}
