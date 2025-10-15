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
import { useSelectedAccount } from '@/lib/hooks/useSelectedAccount';
import { useDeleteAccount } from '@/lib/hooks/useAccountsQuery';
import { useAvailableConnectors } from '@/lib/hooks/useConnectorsQuery';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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
import { Plus } from 'lucide-react';

type View = 'overview' | 'settings';

export default function DashboardPage() {
  const globalSelectedAccount = useSelectedAccount();
  const deleteAccountMutation = useDeleteAccount();
  const { data: connectors = [] } = useAvailableConnectors();

  const [currentView, setCurrentView] = useState<View>('overview');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [accountBeingConfigured, setAccountBeingConfigured] = useState<string | null>(null);

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

  const renderCurrentView = () => {
    switch (currentView) {
      case 'settings':
        if (!accountBeingConfigured) {
          setCurrentView('overview');
          return null;
        }
        return (
          <AccountSettings
            accountName={accountBeingConfigured}
            onBack={handleBackToOverview}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-4">
        <AuthRequiredAlert onConfigureClick={handleConfigureAuth} />
        
        {currentView === 'overview' ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Dashboard</TabsTrigger>
              <TabsTrigger value="history">Performance</TabsTrigger>
              <TabsTrigger value="distribution">Assets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Portfolio Overview</h2>
                <Button onClick={handleAddAccount}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </div>
              <PortfolioOverview />
            </TabsContent>
            
            <TabsContent value="history" className="space-y-3">
              <div className="grid gap-3">
                <PortfolioHistoryChart
                  selectedAccounts={[globalSelectedAccount]}
                  selectedConnectors={connectors}
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="distribution" className="space-y-3">
              <div className="grid gap-3">
                <PortfolioDistribution selectedAccounts={[globalSelectedAccount]} />
              </div>
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