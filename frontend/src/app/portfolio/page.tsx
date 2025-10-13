'use client';

import { useState } from 'react';

// This is the main dashboard page showing portfolio overview
import { MainLayout } from '@/components/layout/main-layout';
import { PortfolioOverview } from '@/components/portfolio/portfolio-overview';
import { AccountSettings } from '@/components/portfolio/account-settings';
import { AddAccountDialog } from '@/components/portfolio/add-account-dialog';
import { PortfolioHistoryChart } from '@/components/portfolio/portfolio-history-chart';
import { PortfolioDistribution } from '@/components/portfolio/portfolio-distribution';
import { AuthRequiredAlert } from '@/components/auth/auth-required-alert';
import { useAccountsUIStore } from '@/lib/store/accounts-ui-store';
import { useDeleteAccount } from '@/lib/hooks/useAccountsQuery';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

type View = 'overview' | 'settings';

export default function DashboardPage() {
  const { selectedAccount, setSelectedAccount } = useAccountsUIStore();
  const deleteAccountMutation = useDeleteAccount();
  
  const [currentView, setCurrentView] = useState<View>('overview');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | '90d' | '1y'>('7d');

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
      
      // If we're currently viewing the deleted account, go back to overview
      if (selectedAccount === accountToDelete) {
        setCurrentView('overview');
        setSelectedAccount(null);
      }
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Failed to delete account:', error);
    }
  };

  const handleViewSettings = (accountName: string) => {
    setSelectedAccount(accountName);
    setCurrentView('settings');
  };



  const handleBackToOverview = () => {
    setCurrentView('overview');
    setSelectedAccount(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'settings':
        if (!selectedAccount) {
          setCurrentView('overview');
          return null;
        }
        return (
          <AccountSettings
            accountName={selectedAccount}
            onBack={handleBackToOverview}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <AuthRequiredAlert onConfigureClick={handleConfigureAuth} />
        
        {currentView === 'overview' ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Dashboard</TabsTrigger>
              <TabsTrigger value="history">Performance</TabsTrigger>
              <TabsTrigger value="distribution">Assets</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <PortfolioOverview
                onAddAccount={handleAddAccount}
                onDeleteAccount={handleDeleteAccount}
                onViewSettings={handleViewSettings}
              />
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <div className="grid gap-4">
                <PortfolioHistoryChart 
                  timeRange={timeRange} 
                  onTimeRangeChange={setTimeRange}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="distribution" className="space-y-4">
              <div className="grid gap-4">
                <PortfolioDistribution />
              </div>
            </TabsContent>
            
            <TabsContent value="accounts" className="space-y-4">
              <PortfolioOverview
                onAddAccount={handleAddAccount}
                onDeleteAccount={handleDeleteAccount}
                onViewSettings={handleViewSettings}
              />
            </TabsContent>
          </Tabs>
        ) : (
          renderCurrentView()
        )}
        
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