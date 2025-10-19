'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, ArrowLeft, Key, Search } from 'lucide-react';
import { useAccountCredentials, useDeleteCredential } from '@/lib/hooks/useAccountsQuery';
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

import { AddCredentialDialog } from '@/components/accounts/add-credential-dialog';

export default function AccountDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const accountName = params.accountName as string;

  const [showAddCredentialDialog, setShowAddCredentialDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const credentialsPerPage = 20;

  const { 
    data: credentials = [], 
    isLoading, 
    error
  } = useAccountCredentials(accountName);

  const deleteCredentialMutation = useDeleteCredential();

  const handleAddCredential = () => {
    setShowAddCredentialDialog(true);
  };

  const handleDeleteCredential = (credentialName: string) => {
    setCredentialToDelete(credentialName);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCredential = async () => {
    if (!credentialToDelete) return;

    try {
      await deleteCredentialMutation.mutateAsync({
        accountName,
        connectorName: credentialToDelete,
      });
      setShowDeleteDialog(false);
      setCredentialToDelete(null);
    } catch (error) {
      console.error('Failed to delete credential:', error);
    }
  };

  // Filter credentials based on search term (fuzzy search) and sort alphabetically
  const filteredCredentials = useMemo(() => {
    let filtered = credentials;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = credentials.filter((credential) => {
        const credentialLower = credential.toLowerCase();

        // Simple fuzzy search: check if all characters of search term exist in order
        let searchIndex = 0;
        for (let i = 0; i < credentialLower.length && searchIndex < searchLower.length; i++) {
          if (credentialLower[i] === searchLower[searchIndex]) {
            searchIndex++;
          }
        }

        return searchIndex === searchLower.length || credentialLower.includes(searchLower);
      });
    }

    // Sort alphabetically
    return filtered.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }, [credentials, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredCredentials.length / credentialsPerPage);
  const startIndex = (currentPage - 1) * credentialsPerPage;
  const paginatedCredentials = filteredCredentials.slice(startIndex, startIndex + credentialsPerPage);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <Alert>
            <AlertDescription>
              {error?.message || 'An error occurred while loading credentials'}
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Key className="h-8 w-8" />
              {accountName}
            </h1>
            <p className="text-muted-foreground">
              Manage credentials and connector configurations for this account
            </p>
          </div>
        </div>

        {/* Credentials List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Credentials
                {!isLoading && (
                  <Badge variant="secondary">
                    {filteredCredentials.length}
                  </Badge>
                )}
              </CardTitle>
              <Button onClick={handleAddCredential}>
                <Plus className="h-4 w-4 mr-2" />
                Add Credential
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search credentials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoading ? (
              <div className="space-y-1">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : paginatedCredentials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? (
                  <>No credentials match your search.</>
                ) : credentials.length === 0 ? (
                  <div className="space-y-4">
                    <Key className="h-16 w-16 text-muted-foreground mx-auto" />
                    <p className="text-lg">No credentials found for {accountName}</p>
                    <p className="text-sm">
                      Add your first credential to start connecting to exchanges
                    </p>
                    <Button onClick={handleAddCredential} size="lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Credential
                    </Button>
                  </div>
                ) : (
                  <>No credentials available.</>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {paginatedCredentials.map((credentialName) => (
                  <div
                    key={credentialName}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors group"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-medium truncate">{credentialName}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCredential(credentialName)}
                        disabled={deleteCredentialMutation.isPending}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

        {/* Add Credential Dialog */}
        <AddCredentialDialog 
          accountName={accountName}
          open={showAddCredentialDialog} 
          onOpenChange={setShowAddCredentialDialog} 
        />
        
        {/* Delete Credential Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the credential
                for &ldquo;{credentialToDelete}&rdquo; connector from account &ldquo;{accountName}&rdquo;.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteCredential}
                disabled={deleteCredentialMutation.isPending}
              >
                {deleteCredentialMutation.isPending ? 'Deleting...' : 'Delete Credential'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}