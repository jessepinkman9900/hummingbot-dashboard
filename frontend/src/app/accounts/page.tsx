'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Shield, Settings, Trash2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const accountsPerPage = 7;

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
  const endIndex = startIndex + accountsPerPage;
  const paginatedAccounts = sortedAccounts.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

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
      <div className="space-y-4">
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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                All Accounts 
                {!isLoading && (
                  <Badge variant="secondary" className="text-xs">
                    {accounts.length}
                  </Badge>
                )}
              </CardTitle>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
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
              <div className="space-y-4">
                {paginatedAccounts.map((accountName) => (
                  <div key={accountName} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <Link 
                      href={`/accounts/${accountName}`} 
                      className="flex items-center space-x-4 flex-1 cursor-pointer"
                    >
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg hover:text-primary transition-colors">{accountName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {accountName === 'master' && (
                            <Badge variant="outline" className="text-xs">
                              Default Account
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.info(`Settings for ${accountName} - Feature coming soon!`)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      {accountName !== 'master' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAccount(accountName);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
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