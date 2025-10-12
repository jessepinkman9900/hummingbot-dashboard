'use client';

import { Plus, Settings, Trash2, Shield, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAccounts, usePortfolioState, useAccountsDistribution } from '@/lib/hooks/useAccountsQuery';

interface PortfolioOverviewProps {
  onAddAccount: () => void;
  onDeleteAccount: (accountName: string) => void;
  onViewSettings: (accountName: string) => void;
  onViewDetails: (accountName: string) => void;
}

export function PortfolioOverview({ 
  onAddAccount, 
  onDeleteAccount, 
  onViewSettings, 
  onViewDetails 
}: PortfolioOverviewProps) {
  const { data: accounts = [], isLoading: loadingAccounts, error: accountsError, refetch: refetchAccounts, isFetching: refreshingAccounts } = useAccounts();
  const { data: portfolioState, isLoading: loadingPortfolio, error: portfolioError, refetch: refetchPortfolio, isFetching: refreshingPortfolio } = usePortfolioState();
  const { data: accountsDistribution, refetch: refetchAccountsDistribution } = useAccountsDistribution();

  const refreshing = refreshingAccounts || refreshingPortfolio;

  const handleRefresh = async () => {
    await Promise.all([
      refetchAccounts(),
      refetchPortfolio(),
      refetchAccountsDistribution()
    ]);
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">
            Manage your trading accounts and view portfolio performance
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
          <Button onClick={onAddAccount}>
            <Plus className="h-4 w-4" />
            Add Portfolio
          </Button>
        </div>
      </div>

      {/* Portfolio Summary */}
      {portfolioState && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(portfolioState.total_balance)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total PnL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getPercentageColor(portfolioState.total_pnl)}`}>
                {formatCurrency(portfolioState.total_pnl)}
              </div>
              <p className={`text-xs ${getPercentageColor(portfolioState.total_pnl_percentage)}`}>
                {formatPercentage(portfolioState.total_pnl_percentage)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(portfolioState.accounts).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {new Date(portfolioState.timestamp).toLocaleString()}
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
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No portfolios found</p>
              <Button onClick={onAddAccount}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Portfolio
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((accountName) => {
                const accountData = portfolioState?.accounts[accountName];
                const accountDistData = accountsDistribution?.accounts[accountName];
                
                return (
                  <div key={accountName} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{accountName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {accountData ? (
                            <>
                              <span>Balance: {formatCurrency(accountData.total_balance)}</span>
                              <span className={getPercentageColor(accountData.total_pnl_percentage)}>
                                PnL: {formatPercentage(accountData.total_pnl_percentage)}
                              </span>
                              <span>Connectors: {Object.keys(accountData.connectors).length}</span>
                            </>
                          ) : (
                            <span>No data available</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {accountDistData && (
                        <Badge variant="secondary">
                          {accountDistData.percentage.toFixed(1)}% of portfolio
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(accountName)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewSettings(accountName)}
                      >
                        <Settings className="h-4 w-4" />
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
    </div>
  );
}