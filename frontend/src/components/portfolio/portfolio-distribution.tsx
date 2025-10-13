'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, Building2 } from 'lucide-react';


import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useAccounts,
  usePortfolioDistribution,
  // useAccountsDistribution
} from '@/lib/hooks/useAccountsQuery';
import { TokenDistributionItem } from '@/lib/types';

interface PortfolioDistributionProps {
  selectedAccounts?: string[];
}

export function PortfolioDistribution({ selectedAccounts }: PortfolioDistributionProps) {
  const { data: accounts = [] } = useAccounts();
  
  // Use selected accounts or all accounts
  const accountsToUse = selectedAccounts && selectedAccounts.length > 0 
    ? selectedAccounts 
    : accounts;
  
  const { 
    data: portfolioDistribution, 
    isLoading: loadingTokens, 
    error: portfolioError
  } = usePortfolioDistribution(accountsToUse);
  

  
  // const { 
  //   data: accountsDistribution, 
  //   isLoading: loadingAccounts, 
  //   error: accountsError,
  //   refetch: refetchAccounts,
  //   isFetching: refreshingAccounts
  // } = useAccountsDistribution(accountsToUse);

  
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
    return `${safeValue.toFixed(1)}%`;
  };
  
  // Transform token distribution data
  const tokenData = React.useMemo(() => {
    if (!portfolioDistribution?.distribution) return [];
    
    return portfolioDistribution.distribution
      .map((data: TokenDistributionItem) => ({
        symbol: data.token,
        value: data.total_value || 0,
        percentage: data.percentage || 0,
        balance: data.total_units || 0,
        accounts: data.accounts || {}
      }))
      .sort((a: any, b: any) => b.value - a.value);
  }, [portfolioDistribution]);
  
  // Transform accounts distribution data
  // const accountData = React.useMemo(() => {
  //   if (!accountsDistribution?.accounts) return [];
  //   
  //   return Object.entries(accountsDistribution.accounts)
  //     .map(([accountName, data]: [string, AccountDistributionItem]) => ({
  //       name: accountName,
  //       value: data.value || 0,
  //       percentage: data.percentage || 0,
  //       connectors: data.connectors || {}
  //     }))
  //     .sort((a, b) => b.value - a.value);
  // }, [accountsDistribution]);
  const accountData: any[] = [];
  
  if (loadingTokens) { // || loadingAccounts
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Distribution</CardTitle>
          <Skeleton className="h-4 w-4 rounded-md" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-2 w-full" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (portfolioError) { // || accountsError
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Portfolio Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Failed to load portfolio distribution. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Portfolio Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tokens" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tokens" className="flex items-center space-x-2">
              <Wallet className="h-4 w-4" />
              <span>By Tokens</span>
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>By Accounts</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tokens" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Total Value</div>
              <div className="font-medium">
                {formatCurrency(portfolioDistribution?.total_portfolio_value || 0)}
              </div>
            </div>
            
            {tokenData.length > 0 ? (
              <div className="space-y-4">
                {tokenData.map((token: any) => (
                  <div key={token.symbol} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {token.symbol.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-xs text-muted-foreground">
                            {token.balance.toLocaleString()} tokens
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(token.value)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatPercentage(token.percentage)}
                        </div>
                      </div>
                    </div>
                    <Progress value={token.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No token data available
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="accounts" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Total Value</div>
              <div className="font-medium">
                {formatCurrency(0)} {/* accountsDistribution?.total_value || 0 */}
              </div>
            </div>
            
            {accountData.length > 0 ? (
              <div className="space-y-4">
                {accountData.map((account) => (
                  <div key={account.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-secondary" />
                        </div>
                        <div>
                          <div className="font-medium">{account.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {Object.keys(account.connectors).length} connector(s)
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(account.value)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatPercentage(account.percentage)}
                        </div>
                      </div>
                    </div>
                    <Progress value={account.percentage} className="h-2" />
                    
                    {/* Show connector breakdown if available */}
                    {Object.keys(account.connectors).length > 0 && (
                      <div className="ml-10 space-y-1">
                        {Object.entries(account.connectors).map(([connector, data]) => (
                          <div key={connector} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{connector}</span>
                            <span className="font-medium">
                              {formatCurrency((data as { value: number }).value || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No account data available
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Filter Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            {selectedAccounts && selectedAccounts.length > 0 ? (
              <div>Filtered by accounts: {selectedAccounts.join(', ')}</div>
            ) : (
              <div>Showing data from all accounts</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}