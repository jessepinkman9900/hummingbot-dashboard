'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { PortfolioChart } from '@/components/charts/portfolio-chart';
import { 
  useAccounts, 
  usePortfolioHistory, 
  usePortfolioState 
} from '@/lib/hooks/useAccountsQuery';
import { useAvailableConnectors } from '@/lib/hooks/useConnectorsQuery';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PortfolioHistoryChartProps {
  selectedAccounts?: string[];
  selectedConnectors?: string[];
  timeRange?: '1d' | '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: '1d' | '7d' | '30d' | '90d' | '1y') => void;
}

export function PortfolioHistoryChart({ 
  selectedAccounts,
  selectedConnectors,
  timeRange = '7d',
  onTimeRangeChange
}: PortfolioHistoryChartProps) {
  const { data: accounts = [] } = useAccounts();
  const { data: connectors = [] } = useAvailableConnectors();
  
  // Build filter request for portfolio history
  const historyFilters = useMemo(() => {
    const filters: Record<string, unknown> = {
      limit: 100, // Request more data points for better chart resolution
    };
    
    // Use all accounts if none selected, otherwise use selected accounts
    const accountsToUse = selectedAccounts && selectedAccounts.length > 0 
      ? selectedAccounts 
      : accounts;
    
    // Use all connectors if none selected, otherwise use selected connectors  
    const connectorsToUse = selectedConnectors && selectedConnectors.length > 0
      ? selectedConnectors
      : connectors;
    
    if (accountsToUse.length > 0) {
      filters.accounts = accountsToUse;
    }
    
    if (connectorsToUse.length > 0) {
      filters.connectors = connectorsToUse;
    }
    
    // Add time range filters
    const endTime = new Date();
    const startTime = new Date();
    
    switch (timeRange) {
      case '1d':
        startTime.setDate(endTime.getDate() - 1);
        break;
      case '7d':
        startTime.setDate(endTime.getDate() - 7);
        break;
      case '30d':
        startTime.setDate(endTime.getDate() - 30);
        break;
      case '90d':
        startTime.setDate(endTime.getDate() - 90);
        break;
      case '1y':
        startTime.setFullYear(endTime.getFullYear() - 1);
        break;
    }
    
    filters.startTime = startTime;
    filters.endTime = endTime;
    
    return filters;
  }, [selectedAccounts, selectedConnectors, accounts, connectors, timeRange]);
  
  const { 
    data: historyData, 
    isLoading: loadingHistory, 
    error: historyError,
    refetch: refetchHistory,
    isFetching: refreshingHistory
  } = usePortfolioHistory(historyFilters);
  
  const { data: currentPortfolio } = usePortfolioState(historyFilters.accounts as string[]);
  
  // Transform history data for the chart
  const chartData = useMemo(() => {
    if (!historyData?.chartData) return [];
    
    return historyData.chartData.map((item: any) => ({
      time: new Date(item.timestamp).getTime() / 1000,
      value: item.totalBalance || 0
    }));
  }, [historyData]);
  
  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (!chartData.length || !historyData?.chartData) {
      return {
        change: 0,
        changePercentage: 0,
        trend: 'neutral' as const
      };
    }
    
    const chartDataArray = historyData.chartData;
    const firstValue = chartDataArray[0]?.totalBalance || 0;
    const lastValue = chartDataArray[chartDataArray.length - 1]?.totalBalance || 0;
    const change = lastValue - firstValue;
    const changePercentage = firstValue > 0 ? (change / firstValue) * 100 : 0;
    
    return {
      change,
      changePercentage,
      trend: change >= 0 ? 'up' as const : 'down' as const
    };
  }, [historyData?.chartData]);
  
  const formatCurrency = (value: number | undefined | null) => {
    const safeValue = value || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(safeValue);
  };
  
  const formatPercentage = (value: number | undefined | null) => {
    const safeValue = value || 0;
    return `${safeValue >= 0 ? '+' : ''}${safeValue.toFixed(2)}%`;
  };
  
  if (loadingHistory) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio History</CardTitle>
          <Skeleton className="h-4 w-4 rounded-md" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (historyError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Portfolio History</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Failed to load portfolio history. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-sm font-medium">Portfolio History</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={timeRange}
            onValueChange={onTimeRangeChange}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">1D</SelectItem>
              <SelectItem value="7d">7D</SelectItem>
              <SelectItem value="30d">30D</SelectItem>
              <SelectItem value="90d">90D</SelectItem>
              <SelectItem value="1y">1Y</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetchHistory()}
            disabled={refreshingHistory}
          >
            <RefreshCw className={`h-4 w-4 ${refreshingHistory ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Performance Summary */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {formatCurrency(currentPortfolio?.total_balance || 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Portfolio Value
              </div>
            </div>
            <div className="text-right">
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                performanceMetrics.trend === 'up' 
                  ? 'text-green-600' 
                  : performanceMetrics.trend === 'down'
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}>
                {performanceMetrics.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : performanceMetrics.trend === 'down' ? (
                  <TrendingDown className="h-4 w-4" />
                ) : null}
                <span>{formatPercentage(performanceMetrics.changePercentage)}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatCurrency(performanceMetrics.change)} ({timeRange})
              </div>
            </div>
          </div>
          
          {/* Chart */}
          {chartData.length > 0 ? (
            <div className="w-full">
              <PortfolioChart 
                data={chartData}
                width={800}
                height={300}
                className="w-full"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No historical data available for the selected period
            </div>
          )}
          
          {/* Filter Summary */}
          <div className="text-xs text-muted-foreground">
            {selectedAccounts && selectedAccounts.length > 0 && (
              <div>Accounts: {selectedAccounts.join(', ')}</div>
            )}
            {selectedConnectors && selectedConnectors.length > 0 && (
              <div>Connectors: {selectedConnectors.join(', ')}</div>
            )}
            {(!selectedAccounts || selectedAccounts.length === 0) && 
             (!selectedConnectors || selectedConnectors.length === 0) && (
              <div>Showing data from all accounts and connectors</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}