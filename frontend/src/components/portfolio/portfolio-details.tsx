'use client';

import { useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccountsStore } from '@/lib/store/accounts-store';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PortfolioDetailsProps {
  accountName: string;
  onBack: () => void;
  onViewSettings: () => void;
}

export function PortfolioDetails({ accountName, onBack, onViewSettings }: PortfolioDetailsProps) {
  const {
    portfolioState,
    loadingPortfolio,
    portfolioError,
    fetchPortfolioData
  } = useAccountsStore();

  useEffect(() => {
    // Fetch portfolio data for this specific account
    fetchPortfolioData([accountName]);
  }, [accountName, fetchPortfolioData]);

  const accountData = portfolioState?.accounts[accountName];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getPercentageColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  if (portfolioError) {
    return (
      <Alert>
        <AlertDescription>
          {portfolioError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{accountName}</h1>
            <p className="text-muted-foreground">
              Portfolio details and performance
            </p>
          </div>
        </div>
        <Button onClick={onViewSettings}>
          Settings
        </Button>
      </div>

      {/* Portfolio Summary */}
      {loadingPortfolio ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[120px]" />
                <Skeleton className="h-4 w-[80px] mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : accountData ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(accountData.total_balance)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total PnL</CardTitle>
              {getTrendIcon(accountData.total_pnl)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getPercentageColor(accountData.total_pnl)}`}>
                {formatCurrency(accountData.total_pnl)}
              </div>
              <p className={`text-xs ${getPercentageColor(accountData.total_pnl_percentage)}`}>
                {formatPercentage(accountData.total_pnl_percentage)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Connectors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(accountData.connectors).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  Object.values(accountData.connectors).reduce(
                    (sum, connector) => sum + connector.available_balance,
                    0
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            No data available for this account. The account may not have any connected exchanges or balances.
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Breakdown */}
      {accountData && (
        <Tabs defaultValue="connectors" className="space-y-4">
          <TabsList>
            <TabsTrigger value="connectors">Connectors</TabsTrigger>
            <TabsTrigger value="tokens">Assets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connectors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Connector Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(accountData.connectors).map(([connectorName, connector]) => (
                  <div key={connectorName} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{connectorName}</h4>
                        <Badge variant="outline">
                          {Object.keys(connector.balances).length} assets
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(connector.total_balance)}
                        </div>
                        <div className={`text-sm ${getPercentageColor(connector.total_pnl_percentage)}`}>
                          {formatPercentage(connector.total_pnl_percentage)}
                        </div>
                      </div>
                    </div>
                    <Progress 
                      value={(connector.total_balance / accountData.total_balance) * 100} 
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground">
                      {((connector.total_balance / accountData.total_balance) * 100).toFixed(1)}% of account balance
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tokens" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Asset Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(accountData.connectors).map(([connectorName, connector]) => (
                  <div key={connectorName} className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {connectorName}
                    </h4>
                    <div className="grid gap-3">
                      {Object.entries(connector.balances).map(([tokenName, balance]) => (
                        <div key={`${connectorName}-${tokenName}`} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-primary">
                                {tokenName.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{tokenName}</div>
                              <div className="text-sm text-muted-foreground">
                                Balance: {balance.balance.toFixed(6)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {formatCurrency(balance.usd_value)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {balance.percentage.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}