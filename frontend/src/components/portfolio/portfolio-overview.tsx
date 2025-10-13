'use client';

import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAccounts, usePortfolioState } from '@/lib/hooks/useAccountsQuery';
import { useSelectedAccount } from '@/lib/hooks/useSelectedAccount';
import Link from 'next/link';

export function PortfolioOverview() {
  const selectedAccount = useSelectedAccount();
  const { error: accountsError } = useAccounts();
  const { data: portfolioState, isLoading: loadingPortfolio, error: portfolioError } = usePortfolioState([selectedAccount]);

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
    return `${value.toFixed(2)}%`;
  };

  const getPercentageColor = (percentage: number | undefined | null) => {
    if (percentage === undefined || percentage === null || isNaN(percentage)) {
      return 'text-muted-foreground';
    }
    return percentage >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (accountsError || portfolioError) {
    return (
      <Alert className="mb-4">
        <AlertDescription>
          Failed to load data. Please check your connection and authentication.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats for Selected Account */}
      {!loadingPortfolio && portfolioState && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="px-4 py-1 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
              <div className="text-xl font-bold">
                {formatCurrency(portfolioState.total_balance)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="px-4 py-1 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
              <div className={`text-xl font-bold flex items-baseline gap-2 ${getPercentageColor(portfolioState.total_pnl)}`}>
                <span>{formatCurrency(portfolioState.total_pnl)}</span>
                <span className="text-sm font-medium">
                  ({formatPercentage(portfolioState.total_pnl_percentage)})
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="px-4 py-1 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Active Connectors</p>
              <div className="text-xl font-bold">
                {Object.keys(portfolioState?.accounts?.[selectedAccount]?.connectors || {}).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Selected Account Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Account: {selectedAccount}</CardTitle>
          <Link href={`/accounts/${selectedAccount}`}>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loadingPortfolio ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : portfolioState?.accounts?.[selectedAccount] ? (
            <div className="space-y-4">
              {/* Account connectors */}
              {Object.entries(portfolioState.accounts[selectedAccount].connectors || {}).map(([connectorName, connectorData]) => {
                const connector = connectorData as any; // Type assertion for now
                return (
                  <div key={connectorName} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{connectorName}</h4>
                      <span className="text-sm text-muted-foreground">
                        Balance: {formatCurrency(connector.total_balance)}
                      </span>
                    </div>
                    
                    {/* Tokens for this connector */}
                    {connector.tokens && Object.keys(connector.tokens).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(connector.tokens).map(([tokenName, tokenData]) => {
                          const token = tokenData as any; // Type assertion for now
                          return (
                            <div key={tokenName} className="p-3 bg-muted/30 rounded">
                              <div className="font-medium text-sm">{tokenName}</div>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <div>Units: {token.units?.toFixed(6) || '0'}</div>
                                <div>Price: {formatCurrency(token.price)}</div>
                                <div>Value: {formatCurrency(token.value)}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No tokens found for this connector</p>
                    )}
                  </div>
                );
              })}
              
              {Object.keys(portfolioState.accounts[selectedAccount].connectors || {}).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No connectors configured for this account</p>
                  <Link href={`/accounts/${selectedAccount}`}>
                    <Button>
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Connectors
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No data available for account: {selectedAccount}</p>
              <Link href={`/accounts/${selectedAccount}`}>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Account
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Updated Footer */}
      {portfolioState && (
        <div className="text-center">
          <span className="text-xs text-muted-foreground">
            Last Updated: {portfolioState.timestamp ? new Date(portfolioState.timestamp).toLocaleString() : 'N/A'}
          </span>
        </div>
      )}
    </div>
  );
}