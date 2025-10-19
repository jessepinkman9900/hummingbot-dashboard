'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Users, ChevronRight, Search } from 'lucide-react';
import { useAccounts } from '@/lib/hooks/useAccountsQuery';
import { AddAccountDialog } from '@/components/portfolio/add-account-dialog';

export default function AccountsPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const accountsPerPage = 20;

  const { 
    data: accounts = [], 
    isLoading, 
    error 
  } = useAccounts();

  const handleAddAccount = () => {
    setShowAddDialog(true);
  };



  // Filter accounts based on search term (fuzzy search) and sort alphabetically
  const filteredAccounts = useMemo(() => {
    let filtered = accounts;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = accounts.filter((account) => {
        const accountLower = account.toLowerCase();

        // Simple fuzzy search: check if all characters of search term exist in order
        let searchIndex = 0;
        for (let i = 0; i < accountLower.length && searchIndex < searchLower.length; i++) {
          if (accountLower[i] === searchLower[searchIndex]) {
            searchIndex++;
          }
        }

        return searchIndex === searchLower.length || accountLower.includes(searchLower);
      });
    }

    // Sort alphabetically
    return filtered.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }, [accounts, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredAccounts.length / accountsPerPage);
  const startIndex = (currentPage - 1) * accountsPerPage;
  const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + accountsPerPage);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
                  {filteredAccounts.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search accounts..."
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
            ) : paginatedAccounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? (
                  <>No accounts match your search.</>
                ) : accounts.length === 0 ? (
                  <div className="space-y-4">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto" />
                    <p className="text-lg">No accounts found</p>
                    <p className="text-sm">
                      Create your first account to get started with Hummingbot
                    </p>
                    <Button onClick={handleAddAccount} size="lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Account
                    </Button>
                  </div>
                ) : (
                  <>No accounts available.</>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {paginatedAccounts.map((accountName) => (
                  <Link
                    key={accountName}
                    href={`/accounts/${accountName}`}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-accent cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-medium truncate">{accountName}</span>
                      {accountName === 'master' && (
                        <span className="text-sm text-muted-foreground">• Default Account</span>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
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
    </MainLayout>
  );
}