'use client';

import { useState } from 'react';

// This is the main dashboard page showing portfolio overview
import { MainLayout } from '@/components/layout/main-layout';
import { AccountSettings } from '@/components/portfolio/account-settings';
import { AddAccountDialog } from '@/components/portfolio/add-account-dialog';
import { PortfolioHistoryChart } from '@/components/portfolio/portfolio-history-chart';
import { PortfolioDistribution } from '@/components/portfolio/portfolio-distribution';
import { AuthRequiredAlert } from '@/components/auth/auth-required-alert';
import { useSelectedAccount } from '@/lib/hooks/useSelectedAccount';
import { useDeleteAccount, useAccounts, usePortfolioState } from '@/lib/hooks/useAccountsQuery';
import { useAvailableConnectors } from '@/lib/hooks/useConnectorsQuery';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Settings, Wallet, Building2 } from 'lucide-react';
import Link from 'next/link';

type View = 'overview' | 'settings';

export default function DashboardPage() {
  const selectedAccount = useSelectedAccount();
  const { data: accounts = [] } = useAccounts();
  const { data: portfolioState, isLoading: loadingPortfolio, error: portfolioError } = usePortfolioState([selectedAccount]);
  const { data: connectors = [] } = useAvailableConnectors();
  const deleteAccountMutation = useDeleteAccount();

  const [currentView, setCurrentView] = useState<View>('overview');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [accountBeingConfigured, setAccountBeingConfigured] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | '90d' | '1y'>('7d');

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

  const handleConfigureAuth = () => {
    // Navigate to auth configuration if needed
  };

  const handleAddAccount = () => {
    setShowAddDialog(true);
  };

  const handleDeleteAccount = (accountName: string) => {
    if (accountName === 'master') {
      toast.error('Cannot delete the master account');
      return;
    }
    setAccountToDelete(accountName);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;
    
    try {
      await deleteAccountMutation.mutateAsync(accountToDelete);
      setShowDeleteDialog(false);
      setAccountToDelete(null);
      
      // If we're currently configuring the deleted account, go back to overview
      if (accountBeingConfigured === accountToDelete) {
        setCurrentView('overview');
        setAccountBeingConfigured(null);
      }
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Failed to delete account:', error);
    }
  };

  const handleViewSettings = (accountName: string) => {
    setAccountBeingConfigured(accountName);
    setCurrentView('settings');
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
    setAccountBeingConfigured(null);
  };

  if (currentView === 'settings' && accountBeingConfigured) {
    return (
      <MainLayout>
        <div className="container mx-auto py-4">
          <AccountSettings
            accountName={accountBeingConfigured}
            onBack={handleBackToOverview}
          />
        </div>
      </MainLayout>
    );
  }

  if (portfolioError) {
    return (
      <MainLayout>
        <div className="container mx-auto py-4">
          <AuthRequiredAlert onConfigureClick={handleConfigureAuth} />
          <Alert className="mb-4">
            <AlertDescription>
              Failed to load portfolio data. Please check your connection and authentication.
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-4 space-y-6">
        <AuthRequiredAlert onConfigureClick={handleConfigureAuth} />
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <Button onClick={handleAddAccount}>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>

        {/* Layer 1 - Total Balance, Total PNL, Active Connectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loadingPortfolio ? (
            <>
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </>
          ) : (
            <>
              <Card>
                <CardContent className="px-4 py-4 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                  <div className="text-2xl font-bold">
                    {formatCurrency(portfolioState?.total_balance)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="px-4 py-4 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
                  <div className={`text-2xl font-bold flex items-baseline gap-2 ${getPercentageColor(portfolioState?.total_pnl)}`}>
                    <span>{formatCurrency(portfolioState?.total_pnl)}</span>
                    <span className="text-sm font-medium">
                      ({formatPercentage(portfolioState?.total_pnl_percentage)})
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="px-4 py-4 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Active Connectors</p>
                  <div className="text-2xl font-bold">
                    {Object.keys(portfolioState?.accounts?.[selectedAccount]?.connectors || {}).length}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Layer 2 - Portfolio Historical Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioHistoryChart
              selectedAccounts={[selectedAccount]}
              selectedConnectors={connectors}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          </CardContent>
        </Card>

        {/* Layer 3 - Asset Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioDistribution selectedAccounts={[selectedAccount]} />
          </CardContent>
        </Card>

        {/* Layer 4 - Accounts Connectors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Account Connectors: {selectedAccount}</CardTitle>
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
                  const connector = connectorData as any;
                  return (
                    <div key={connectorName} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <h4 className="font-medium">{connectorName}</h4>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Balance: {formatCurrency(connector.total_balance)}
                        </span>
                      </div>
                      
                      {/* Tokens for this connector */}
                      {connector.tokens && Object.keys(connector.tokens).length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Object.entries(connector.tokens).map(([tokenName, tokenData]) => {
                            const token = tokenData as any;
                            return (
                              <div key={tokenName} className="p-3 bg-muted/30 rounded flex items-start gap-3">
                                <Wallet className="h-4 w-4 mt-1 text-muted-foreground" />
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{tokenName}</div>
                                  <div className="text-xs text-muted-foreground space-y-1">
                                    <div>Units: {token.units?.toFixed(6) || '0'}</div>
                                    <div>Price: {formatCurrency(token.price)}</div>
                                    <div>Value: {formatCurrency(token.value)}</div>
                                  </div>
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
        
        <AddAccountDialog 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog} 
        />
        
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the account
                &ldquo;{accountToDelete}&rdquo; and remove all associated credentials.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAccountToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteAccount}>
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}