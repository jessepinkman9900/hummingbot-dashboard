'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Bot,
  RefreshCw 
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';

// Mock data for initial display
const mockPortfolioData = {
  totalBalance: 125000.50,
  totalPnL: 2450.75,
  totalPnLPercentage: 2.01,
  assetDistribution: [
    { symbol: 'BTC', balance: 2.5, value: 87500, percentage: 70 },
    { symbol: 'ETH', balance: 12.3, value: 24600, percentage: 19.7 },
    { symbol: 'USDT', balance: 12900.5, value: 12900.5, percentage: 10.3 },
  ]
};

const mockBots = [
  { id: '1', name: 'BTC-USDT Market Maker', status: 'running' as const, pnl: 150.25 },
  { id: '2', name: 'ETH-USDT Arbitrage', status: 'running' as const, pnl: 89.50 },
  { id: '3', name: 'Multi-pair Grid', status: 'stopped' as const, pnl: -25.75 },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const { updateTimestamp } = useAppStore();

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      updateTimestamp(); // Update global timestamp when data loads
    }, 1000);
    return () => clearTimeout(timer);
  }, [updateTimestamp]);

  const handleRefresh = () => {
    setLoading(true);
    updateTimestamp(); // Update global timestamp on refresh
    setTimeout(() => setLoading(false), 1000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Trading overview and portfolio performance
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Portfolio Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold">
                  {formatCurrency(mockPortfolioData.totalBalance)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              {mockPortfolioData.totalPnL >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="space-y-1">
                  <div className={`text-2xl font-bold ${
                    mockPortfolioData.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(mockPortfolioData.totalPnL)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(mockPortfolioData.totalPnLPercentage)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {mockBots.filter(bot => bot.status === 'running').length}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Asset Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Distribution</CardTitle>
            <CardDescription>
              Current portfolio allocation across different assets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {mockPortfolioData.assetDistribution.map((asset) => (
                  <div key={asset.symbol} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="font-medium">{asset.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {asset.balance} {asset.symbol}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium">
                        {formatCurrency(asset.value)}
                      </div>
                      <div className="w-16 text-right text-sm text-muted-foreground">
                        {asset.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Bots */}
        <Card>
          <CardHeader>
            <CardTitle>Trading Bots</CardTitle>
            <CardDescription>
              Overview of your active trading bot instances
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {mockBots.map((bot) => (
                  <div key={bot.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{bot.name}</div>
                      <Badge 
                        variant={bot.status === 'running' ? 'default' : 'secondary'}
                        className={bot.status === 'running' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {bot.status}
                      </Badge>
                    </div>
                    <div className={`text-sm font-medium ${
                      bot.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {bot.pnl >= 0 ? '+' : ''}{formatCurrency(bot.pnl)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}