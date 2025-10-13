'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, RefreshCw, Shield, Trash2, ArrowLeft, Key } from 'lucide-react';
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
import { toast } from 'sonner';
import { AddCredentialDialog } from '@/components/accounts/add-credential-dialog';

export default function AccountDetailsPage() {
  const params = useParams();
  const accountName = params.accountName as string;
  
  const [showAddCredentialDialog, setShowAddCredentialDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<string | null>(null);

  const { 
    data: credentials = [], 
    isLoading, 
    error, 
    refetch,
    isFetching 
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

  const handleRefresh = () => {
    refetch();
  };

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/accounts">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Accounts
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Credentials for {accountName}
              </h1>
              <p className="text-muted-foreground">
                Manage credentials and connector configurations for this account
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching || isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleAddCredential}>
              <Plus className="h-4 w-4 mr-2" />
              Add Credential
            </Button>
          </div>
        </div>

        {/* Credentials Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credentials</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16" /> : credentials.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {error ? (
                  <Badge variant="destructive">Error</Badge>
                ) : (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {new Date().toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Credentials List */}
        <Card>
          <CardHeader>
            <CardTitle>Credentials from /accounts/{accountName}/credentials Endpoint</CardTitle>
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
            ) : credentials.length === 0 ? (
              <div className="text-center py-12">
                <Key className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4 text-lg">
                  No credentials found for {accountName}
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Add your first credential to start connecting to exchanges
                </p>
                <Button onClick={handleAddCredential} size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Credential
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {credentials.map((credentialName, index) => (
                  <div key={credentialName} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Key className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{credentialName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Connector #{index + 1}</span>
                          <Badge variant="outline" className="text-xs">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        Configured
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCredential(credentialName)}
                        disabled={deleteCredentialMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Raw API Response Details */}
        <Card>
          <CardHeader>
            <CardTitle>Raw API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
              {JSON.stringify({ credentials: credentials || [] }, null, 2)}
            </pre>
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