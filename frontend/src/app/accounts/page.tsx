'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Settings, Trash2, Users, ChevronRight } from 'lucide-react';
import { useAccounts, useDeleteAccount } from '@/lib/hooks/useAccountsQuery';
import { AddAccountDialog } from '@/components/portfolio/add-account-dialog';
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
import { toast } from 'sonner';

export default function AccountsPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const accountsPerPage = 20;

  const { 
    data: accounts = [], 
    isLoading, 
    error 
  } = useAccounts();

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

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;
    
    try {
      await deleteAccountMutation.mutateAsync(accountToDelete);
      setShowDeleteDialog(false);
      setAccountToDelete(null);
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };



  // Pagination logic
  const sortedAccounts = [...accounts].sort((a, b) => a.localeCompare(b));
  const totalPages = Math.ceil(sortedAccounts.length / accountsPerPage);
  const startIndex = (currentPage - 1) * accountsPerPage;
  const paginatedAccounts = sortedAccounts.slice(startIndex, startIndex + accountsPerPage);

  if (error) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Alert>
            <AlertDescription>
              {error?.message || 'An error occurred while loading accounts'}
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
              <p className="text-muted-foreground">
                Manage your Hummingbot accounts and view their details
              </p>
            </div>
          </div>
          <Button onClick={handleAddAccount}>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>

        {/* Accounts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Accounts
              {!isLoading && (
                <Badge variant="secondary">
                  {accounts.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-1">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4 text-lg">No accounts found</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Create your first account to get started with Hummingbot
                </p>
                <Button onClick={handleAddAccount} size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Account
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {paginatedAccounts.map((accountName) => (
                  <div
                    key={accountName}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-accent cursor-pointer transition-colors group"
                  >
                    <Link
                      href={`/accounts/${accountName}`}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-medium truncate">{accountName}</span>
                        {accountName === 'master' && (
                          <span className="text-sm text-muted-foreground">• Default Account</span>
                        )}
                      </div>
                    </Link>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          toast.info(`Settings for ${accountName} - Feature coming soon!`);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      {accountName !== 'master' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteAccount(accountName);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 py-2 text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Account Dialog */}
      <AddAccountDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
      
      {/* Delete Account Dialog */}
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
    </MainLayout>
  );
}