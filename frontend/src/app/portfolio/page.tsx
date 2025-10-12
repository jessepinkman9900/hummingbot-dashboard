'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { PortfolioOverview } from '@/components/portfolio/portfolio-overview';
import { PortfolioDetails } from '@/components/portfolio/portfolio-details';
import { AccountSettings } from '@/components/portfolio/account-settings';
import { AddAccountDialog } from '@/components/portfolio/add-account-dialog';
import { AuthRequiredAlert } from '@/components/auth/auth-required-alert';
import { useAccountsUIStore } from '@/lib/store/accounts-ui-store';
import { useDeleteAccount } from '@/lib/hooks/useAccountsQuery';
import { toast } from 'sonner';
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

type View = 'overview' | 'details' | 'settings';

export default function PortfolioPage() {
  const { selectedAccount, setSelectedAccount } = useAccountsUIStore();
  const deleteAccountMutation = useDeleteAccount();
  
  const [currentView, setCurrentView] = useState<View>('overview');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [showHealthStatus, setShowHealthStatus] = useState(false);

  const handleConfigureAuth = () => {
    setShowHealthStatus(true);
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

  const handleViewDetails = (accountName: string) => {
    setSelectedAccount(accountName);
    setCurrentView('details');
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
    setSelectedAccount(null);
  };

  const handleViewSettingsFromDetails = () => {
    setCurrentView('settings');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return (
          <PortfolioOverview
            onAddAccount={handleAddAccount}
            onDeleteAccount={handleDeleteAccount}
            onViewSettings={handleViewSettings}
            onViewDetails={handleViewDetails}
          />
        );
        
      case 'details':
        if (!selectedAccount) {
          setCurrentView('overview');
          return null;
        }
        return (
          <PortfolioDetails
            accountName={selectedAccount}
            onBack={handleBackToOverview}
            onViewSettings={handleViewSettingsFromDetails}
          />
        );
        
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
        {renderCurrentView()}
        
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