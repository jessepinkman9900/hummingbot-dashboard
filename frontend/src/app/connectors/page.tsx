'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plug, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ConnectorsResponse {
  connectors: string[];
  total: number;
}

export default function ConnectorsPage() {
  const router = useRouter();
  const [connectors, setConnectors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch connectors
  useEffect(() => {
    const fetchConnectors = async () => {
      try {
        setLoading(true);
        // Import the connectorsApi directly
        const { connectorsApi } = await import('@/lib/api/connectors');
        const data = await connectorsApi.getAvailableConnectors();
        setConnectors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching connectors:', err);
        if (err instanceof Error && err.message.includes('401')) {
          setError('Authentication required. Please configure your API credentials in the system settings.');
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConnectors();
  }, []);

  // Filter connectors based on search term (fuzzy search) and sort alphabetically
  const filteredConnectors = useMemo(() => {
    let filtered = connectors;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = connectors.filter((connector) => {
        const connectorLower = connector.toLowerCase();
        
        // Simple fuzzy search: check if all characters of search term exist in order
        let searchIndex = 0;
        for (let i = 0; i < connectorLower.length && searchIndex < searchLower.length; i++) {
          if (connectorLower[i] === searchLower[searchIndex]) {
            searchIndex++;
          }
        }
        
        return searchIndex === searchLower.length || connectorLower.includes(searchLower);
      });
    }
    
    // Sort alphabetically
    return filtered.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }, [connectors, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredConnectors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConnectors = filteredConnectors.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleConnectorClick = (connectorName: string) => {
    router.push(`/connectors/${connectorName}`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center space-x-2">
            <Plug className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Connectors</h1>
              <p className="text-muted-foreground">
                Explore available trading connectors and their configurations
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center space-x-2">
            <Plug className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Connectors</h1>
              <p className="text-muted-foreground">
                Explore available trading connectors and their configurations
              </p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-red-500">
                  <Plug className="mx-auto h-12 w-12 mb-2" />
                  <h2 className="text-xl font-semibold">Failed to load connectors</h2>
                  <p className="text-muted-foreground">{error}</p>
                </div>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center space-x-2">
          <Plug className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Connectors</h1>
            <p className="text-muted-foreground">
              Explore available trading connectors and their configurations
            </p>
          </div>
        </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Available Connectors
            <Badge variant="secondary">{filteredConnectors.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search connectors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Connectors Grid */}
          {paginatedConnectors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No connectors match your search.' : 'No connectors available.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {paginatedConnectors.map((connector) => (
                <Card
                  key={connector}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleConnectorClick(connector)}
                >
                  <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Plug className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">{connector}</h3>
                        <p className="text-sm text-muted-foreground">
                          {connector.includes('testnet') ? 'Testnet' : 'Mainnet'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
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
    </MainLayout>
  );
}