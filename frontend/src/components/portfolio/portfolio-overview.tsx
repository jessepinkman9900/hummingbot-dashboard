'use client';

import { Plus, Settings, Trash2, Shield, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAccounts, usePortfolioState } from '@/lib/hooks/useAccountsQuery';
import Link from 'next/link';

interface PortfolioOverviewProps {
  onAddAccount: () => void;
  onDeleteAccount: (accountName: string) => void;
  onViewSettings: (accountName: string) => void;
}

export function PortfolioOverview({ 
  onAddAccount, 
  onDeleteAccount, 
  onViewSettings 
}: PortfolioOverviewProps) {
  const { data: accounts = [], isLoading: loadingAccounts, error: accountsError, refetch: refetchAccounts, isFetching: refreshingAccounts } = useAccounts();
  const { data: portfolioState, isLoading: loadingPortfolio, error: portfolioError, refetch: refetchPortfolio, isFetching: refreshingPortfolio } = usePortfolioState();
  // const { data: accountsDistribution, refetch: refetchAccountsDistribution } = useAccountsDistribution();

  const refreshing = refreshingAccounts || refreshingPortfolio;

  const handleRefresh = async () => {
    await Promise.all([
      refetchAccounts(),
      refetchPortfolio(),
      // refetchAccountsDistribution()
    ]);
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.00%';
    }
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getPercentageColor = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'text-gray-600';
    }
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (accountsError || portfolioError) {
    return (
      <Alert>
        <AlertDescription>
          {(accountsError || portfolioError)?.message || 'An error occurred while loading data'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Trading overview and portfolio performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loadingAccounts || loadingPortfolio}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={onAddAccount}
          >
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Portfolio Summary */}
      {portfolioState && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(portfolioState?.total_balance)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Total PnL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getPercentageColor(portfolioState?.total_pnl)}`}>
                {formatCurrency(portfolioState?.total_pnl)}
              </div>
              <p className={`text-xs ${getPercentageColor(portfolioState?.total_pnl_percentage)}`}>
                {formatPercentage(portfolioState?.total_pnl_percentage)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Active Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(portfolioState?.accounts || {}).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAccounts ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No accounts found</p>
              <Button onClick={onAddAccount}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((accountName) => {
                const accountData = portfolioState?.accounts[accountName];
                // const accountDistData = accountsDistribution?.accounts[accountName];
                
                return (
                  <div key={accountName} className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-md flex items-center justify-center">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{accountName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {accountData ? (
                            <>
                              <span>Balance: {formatCurrency(accountData?.total_balance)}</span>
                              <span className={getPercentageColor(accountData?.total_pnl_percentage)}>
                                PnL: {formatPercentage(accountData?.total_pnl_percentage)}
                              </span>
                              <span>Connectors: {Object.keys(accountData?.connectors || {}).length}</span>
                            </>
                          ) : (
                            <span>No data available</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* accountDistData && accountDistData.percentage != null && (
                        <Badge variant="secondary">
                          {accountDistData.percentage.toFixed(1)}% of portfolio
                        </Badge>
                      ) */}
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link href={`/accounts/${accountName}`}>
                          <Settings className="h-4 w-4" />
                        </Link>
                      </Button>
                      {accountName !== 'master' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteAccount(accountName)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sticky Footer with Last Updated */}
      {portfolioState && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border px-6 py-2 z-10">
          <div className="flex justify-center items-center">
            <span className="text-xs text-muted-foreground">
              Last Updated: {portfolioState.timestamp ? new Date(portfolioState.timestamp).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}