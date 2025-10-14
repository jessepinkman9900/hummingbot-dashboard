'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { PortfolioOverview } from '@/components/portfolio/portfolio-overview';
import { AddAccountDialog } from '@/components/portfolio/add-account-dialog';
import { Button } from '@/components/ui/button';
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

export default function DashboardPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  const deleteAccountMutation = useDeleteAccount();

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

  const handleViewSettings = (_accountName: string) => {
    // This is now handled by the PortfolioOverview component internally
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;
    
    try {
      await deleteAccountMutation.mutateAsync(accountToDelete);
      setShowDeleteDialog(false);
      setAccountToDelete(null);
      toast.success(`Account "${accountToDelete}" deleted successfully`);
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleAddAccount}>Add Account</Button>
        </div>
        <PortfolioOverview />

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
              <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
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