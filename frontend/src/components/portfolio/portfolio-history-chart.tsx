'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart";

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
  console.log('🔥 PortfolioHistoryChart RENDERED', { selectedAccounts, selectedConnectors, timeRange });

  const { data: accounts = [] } = useAccounts();
  const { data: connectors = [] } = useAvailableConnectors();

  console.log('📊 Accounts and Connectors loaded:', { accounts, connectors });
  
  // Build filter request for portfolio history
  const historyFilters = useMemo(() => {
    const filters: Record<string, unknown> = {
      limit: 100, // Request more data points for better chart resolution
    };

    // Use selected accounts if provided, otherwise use all accounts
    const accountsToUse = selectedAccounts && selectedAccounts.length > 0
      ? selectedAccounts
      : accounts;

    // Use selected connectors if provided, otherwise use all connectors
    const connectorsToUse = selectedConnectors && selectedConnectors.length > 0
      ? selectedConnectors
      : connectors;

    // Only add if we have actual values (arrays of strings)
    if (accountsToUse && accountsToUse.length > 0) {
      filters.accounts = accountsToUse;
    }

    if (connectorsToUse && connectorsToUse.length > 0) {
      filters.connectors = connectorsToUse;
    }

    // NOTE: Temporarily setting start_time and end_time to 0 to fetch all historical data
    // This will be fixed once we confirm data is being returned and parsed correctly
    // The backend interprets 0 as "no time filter" and returns all available data

    return filters;
  }, [selectedAccounts, selectedConnectors, accounts, connectors, timeRange]);

  console.log('🎯 History Filters created:', historyFilters);

  const {
    data: historyData,
    isLoading: loadingHistory,
    error: historyError
  } = usePortfolioHistory(historyFilters);

  console.log('📈 usePortfolioHistory result:', { historyData, loadingHistory, historyError });

  const { data: currentPortfolio } = usePortfolioState(historyFilters.accounts as string[]);

  // Debug logging
  React.useEffect(() => {
    console.log('Portfolio History Debug:', {
      historyFilters,
      accounts,
      connectors,
      selectedAccounts,
      selectedConnectors,
      historyData,
      loadingHistory,
      historyError
    });
  }, [historyFilters, accounts, connectors, selectedAccounts, selectedConnectors, historyData, loadingHistory, historyError]);
  
  // Transform history data for the chart
  const chartData = useMemo(() => {
    console.log('🔧 Transforming chartData from historyData:', historyData);

    if (!historyData?.chartData) {
      console.warn('⚠️ No chartData in historyData:', historyData);
      return [];
    }

    const transformed = historyData.chartData.map((item: any) => ({
      timestamp: new Date(item.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      value: item.totalBalance || 0,
      fullTimestamp: new Date(item.timestamp).toLocaleString()
    }));

    console.log('📊 Final chartData for Recharts:', {
      length: transformed.length,
      sample: transformed.slice(0, 3),
      all: transformed
    });

    return transformed;
  }, [historyData]);

  // Chart configuration for shadcn/ui chart
  const chartConfig: ChartConfig = {
    value: {
      label: "Portfolio Value",
      color: "hsl(var(--chart-1))",
    },
  };
  
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
              Failed to load portfolio history: {historyError instanceof Error ? historyError.message : 'Unknown error'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Show message if no accounts are available
  if (!accounts || accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Portfolio History</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              No accounts available. Please add an account to view portfolio history.
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
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis
                  dataKey="timestamp"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                  tickFormatter={(value) => {
                    // Show abbreviated timestamp
                    return value.split(',')[0];
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => value}
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Portfolio Value']}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2.5}
                  fill="url(#colorValue)"
                  fillOpacity={1}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2, fill: "hsl(var(--foreground))", stroke: "hsl(var(--background))" }}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-3 px-4">
              <div className="text-lg font-medium text-muted-foreground">
                No historical data available for the selected period
              </div>
              <div className="text-sm text-muted-foreground max-w-md">
                Portfolio history is recorded automatically by the backend every few minutes.
                Make sure your Hummingbot instance is running and has active connectors with credentials configured.
              </div>
              <div className="text-xs text-muted-foreground/70">
                Time range: {timeRange} • Accounts: {selectedAccounts?.join(', ') || 'all'} • Connectors: {selectedConnectors?.length || 0} connected
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}