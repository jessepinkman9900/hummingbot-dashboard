'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Settings, TrendingUp, Plug, Key, DollarSign, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TradingRule {
  min_order_size: number;
  max_order_size: number;
  min_price_increment: number;
  min_base_amount_increment: number;
  min_quote_amount_increment: number;
  min_notional_size: number;
  min_order_value: number;
  max_price_significant_digits: number;
  supports_limit_orders: boolean;
  supports_market_orders: boolean;
  buy_order_collateral_token: string;
  sell_order_collateral_token: string;
}

interface TradingRules {
  [symbol: string]: TradingRule;
}

export default function ConnectorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const connectorName = params.connector as string;

  const [configMap, setConfigMap] = useState<string[]>([]);
  const [tradingRules, setTradingRules] = useState<TradingRules>({});
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingRules, setLoadingRules] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [rulesError, setRulesError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch both config map and trading rules simultaneously when page loads
  useEffect(() => {
    const fetchConnectorData = async () => {
      if (!connectorName) return;

      try {
        // Set loading states
        setLoadingConfig(true);
        setLoadingRules(true);
        
        // Import the connectorsApi directly
        const { connectorsApi } = await import('@/lib/api/connectors');
        
        // Fetch both config map and trading rules in parallel
        const [configMapResult, tradingRulesResult] = await Promise.allSettled([
          connectorsApi.getConnectorConfigMap(connectorName),
          connectorsApi.getTradingRules(connectorName)
        ]);

        // Handle config map result
        if (configMapResult.status === 'fulfilled') {
          setConfigMap(Array.isArray(configMapResult.value) ? configMapResult.value : []);
        } else {
          console.error('Error fetching config map:', configMapResult.reason);
          if (configMapResult.reason instanceof Error && configMapResult.reason.message.includes('401')) {
            setConfigError('Authentication required. Please configure your API credentials.');
          } else {
            setConfigError(configMapResult.reason instanceof Error ? configMapResult.reason.message : 'An error occurred');
          }
        }

        // Handle trading rules result
        if (tradingRulesResult.status === 'fulfilled') {
          setTradingRules(tradingRulesResult.value || {});
        } else {
          console.error('Error fetching trading rules:', tradingRulesResult.reason);
          if (tradingRulesResult.reason instanceof Error && tradingRulesResult.reason.message.includes('401')) {
            setRulesError('Authentication required. Please configure your API credentials.');
          } else {
            setRulesError(tradingRulesResult.reason instanceof Error ? tradingRulesResult.reason.message : 'An error occurred');
          }
        }
      } catch (err) {
        console.error('Unexpected error fetching connector data:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setConfigError(errorMessage);
        setRulesError(errorMessage);
      } finally {
        // Always set loading to false for both
        setLoadingConfig(false);
        setLoadingRules(false);
      }
    };

    fetchConnectorData();
  }, [connectorName]);

  const formatConfigKey = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const isSecretField = (key: string) => {
    const secretKeywords = ['secret', 'key', 'password', 'token', 'private'];
    return secretKeywords.some(keyword => key.toLowerCase().includes(keyword));
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    } else if (value < 0.001) {
      return value.toExponential(2);
    }
    return value.toString();
  };

  // Filter and sort trading pairs based on search term (fuzzy search) and alphabetically
  const filteredTradingPairs = useMemo(() => {
    // First sort trading pairs alphabetically
    const allPairs = Object.keys(tradingRules).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    
    if (!searchTerm) return allPairs;

    const searchLower = searchTerm.toLowerCase();
    return allPairs.filter((pair) => {
      const pairLower = pair.toLowerCase();
      
      // Simple fuzzy search: check if all characters of search term exist in order
      let searchIndex = 0;
      for (let i = 0; i < pairLower.length && searchIndex < searchLower.length; i++) {
        if (pairLower[i] === searchLower[searchIndex]) {
          searchIndex++;
        }
      }
      
      return searchIndex === searchLower.length || pairLower.includes(searchLower);
    });
  }, [tradingRules, searchTerm]);

  // Pagination for trading pairs
  const totalPages = Math.ceil(filteredTradingPairs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTradingPairs = filteredTradingPairs.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const tradingPairs = Object.keys(tradingRules);

  return (
    <MainLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Plug className="h-8 w-8" />
            {connectorName}
          </h1>
          <p className="text-muted-foreground">
            Connector configuration and trading rules
          </p>
        </div>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trading Rules
          </TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Connector Configuration
                <Badge variant="secondary">{configMap.length} fields</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingConfig ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : configError ? (
                <Alert variant="destructive">
                  <AlertDescription>{configError}</AlertDescription>
                </Alert>
              ) : configMap.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No configuration fields available
                </div>
              ) : (
                <div className="space-y-3">
                  {configMap.map((field, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {isSecretField(field) ? (
                          <Key className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <Settings className="h-4 w-4 text-blue-500" />
                        )}
                        <div>
                          <p className="font-medium">{formatConfigKey(field)}</p>
                          <p className="text-sm text-muted-foreground">{field}</p>
                        </div>
                      </div>
                      <Badge variant={isSecretField(field) ? "destructive" : "default"}>
                        {isSecretField(field) ? "Secret" : "Config"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trading Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trading Rules
                <Badge variant="secondary">{filteredTradingPairs.length} pairs</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingRules ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-32" />
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Array.from({ length: 6 }).map((_, j) => (
                            <Skeleton key={j} className="h-16" />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : rulesError ? (
                <Alert variant="destructive">
                  <AlertDescription>{rulesError}</AlertDescription>
                </Alert>
              ) : tradingPairs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No trading rules available
                </div>
              ) : (
                <>
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search trading pairs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Trading Pairs */}
                  {paginatedTradingPairs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No trading pairs match your search.' : 'No trading pairs available.'}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {paginatedTradingPairs.map((pair) => {
                    const rules = tradingRules[pair];
                    return (
                      <Card key={pair}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            {pair}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-muted-foreground">Order Size</h4>
                              <div className="text-sm space-y-1">
                                <div>Min: <span className="font-mono">{formatNumber(rules.min_order_size)}</span></div>
                                <div>Max: <span className="font-mono">{formatNumber(rules.max_order_size)}</span></div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-muted-foreground">Price Increment</h4>
                              <div className="text-sm space-y-1">
                                <div>Min: <span className="font-mono">{rules.min_price_increment}</span></div>
                                <div>Digits: <span className="font-mono">{rules.max_price_significant_digits}</span></div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-muted-foreground">Amount Increment</h4>
                              <div className="text-sm space-y-1">
                                <div>Base: <span className="font-mono">{formatNumber(rules.min_base_amount_increment)}</span></div>
                                <div>Quote: <span className="font-mono">{formatNumber(rules.min_quote_amount_increment)}</span></div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-muted-foreground">Order Value</h4>
                              <div className="text-sm space-y-1">
                                <div>Min Notional: <span className="font-mono">{formatNumber(rules.min_notional_size)}</span></div>
                                <div>Min Value: <span className="font-mono">{formatNumber(rules.min_order_value)}</span></div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-muted-foreground">Order Types</h4>
                              <div className="space-y-1">
                                <Badge variant={rules.supports_limit_orders ? "default" : "secondary"}>
                                  Limit Orders
                                </Badge>
                                <Badge variant={rules.supports_market_orders ? "default" : "secondary"}>
                                  Market Orders
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-muted-foreground">Collateral</h4>
                              <div className="text-sm space-y-1">
                                <div>Buy: <span className="font-mono">{rules.buy_order_collateral_token}</span></div>
                                <div>Sell: <span className="font-mono">{rules.sell_order_collateral_token}</span></div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 pt-4">
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
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </MainLayout>
  );
}