'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useAccounts } from '@/lib/hooks/useAccountsQuery';
import { useAvailableConnectors, useConnectorConfigMap, useTradingRules, useSupportedOrderTypes } from '@/lib/hooks/useConnectorsQuery';

export function AuthTestComponent() {
  const [testConnector, setTestConnector] = useState('binance');
  const [testTradingPairs, setTestTradingPairs] = useState('BTC-USDT,ETH-USDT');
  
  const { 
    data: accounts, 
    error: accountsError, 
    isLoading: accountsLoading, 
    refetch: refetchAccounts,
    isFetching: accountsFetching
  } = useAccounts();
  
  const { 
    data: connectors, 
    error: connectorsError, 
    isLoading: connectorsLoading, 
    refetch: refetchConnectors,
    isFetching: connectorsFetching
  } = useAvailableConnectors();

  const { 
    data: configMap, 
    error: configMapError, 
    isLoading: configMapLoading, 
    refetch: refetchConfigMap,
    isFetching: configMapFetching
  } = useConnectorConfigMap(testConnector, false);

  const { 
    data: tradingRules, 
    error: tradingRulesError, 
    isLoading: tradingRulesLoading, 
    refetch: refetchTradingRules,
    isFetching: tradingRulesFetching
  } = useTradingRules(testConnector, testTradingPairs.split(',').filter(p => p.trim()), false);

  const { 
    data: orderTypes, 
    error: orderTypesError, 
    isLoading: orderTypesLoading, 
    refetch: refetchOrderTypes,
    isFetching: orderTypesFetching
  } = useSupportedOrderTypes(testConnector, false);

  const testAllAPIs = async () => {
    await Promise.all([
      refetchAccounts(),
      refetchConnectors(),
      refetchConfigMap(),
      refetchTradingRules(),
      refetchOrderTypes()
    ]);
  };

  const testConnectorAPIs = async () => {
    await Promise.all([
      refetchConfigMap(),
      refetchTradingRules(),
      refetchOrderTypes()
    ]);
  };

  const getStatusBadge = (isLoading: boolean, isFetching: boolean, error: any, data: any) => {
    if (isLoading || isFetching) {
      return <Badge variant="outline"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Loading</Badge>;
    }
    if (error) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
    }
    if (data) {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
    }
    return <Badge variant="secondary">Not loaded</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>API Authentication Test</CardTitle>
        <p className="text-sm text-muted-foreground">
          Test if basic authentication is working for Hummingbot API endpoints
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={testAllAPIs}>Test All APIs</Button>
          <Button variant="outline" onClick={() => refetchAccounts()}>Test Accounts</Button>
          <Button variant="outline" onClick={() => refetchConnectors()}>Test Connectors</Button>
          <Button variant="outline" onClick={testConnectorAPIs}>Test Connector Details</Button>
        </div>
        
        {/* Connector Test Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
          <div>
            <label className="text-sm font-medium mb-2 block">Test Connector</label>
            <Input 
              value={testConnector} 
              onChange={(e) => setTestConnector(e.target.value)}
              placeholder="e.g., binance, kucoin, etc."
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Trading Pairs (comma-separated)</label>
            <Input 
              value={testTradingPairs} 
              onChange={(e) => setTestTradingPairs(e.target.value)}
              placeholder="e.g., BTC-USDT,ETH-USDT"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <div className="font-medium">/accounts API</div>
              <div className="text-sm text-muted-foreground">
                {accounts 
                  ? `Found ${accounts.length} accounts: ${JSON.stringify(accounts)}`
                  : accountsError?.message || 'Fetches list of available accounts'
                }
              </div>
            </div>
            {getStatusBadge(accountsLoading, accountsFetching, accountsError, accounts)}
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <div className="font-medium">/connectors API</div>
              <div className="text-sm text-muted-foreground">
                {connectors 
                  ? `Found ${connectors.length} connectors`
                  : connectorsError?.message || 'Fetches list of available connectors'
                }
              </div>
            </div>
            {getStatusBadge(connectorsLoading, connectorsFetching, connectorsError, connectors)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <div className="font-medium">/connectors/{testConnector}/config-map API</div>
              <div className="text-sm text-muted-foreground">
                {configMap 
                  ? `Found ${configMap.length} config fields`
                  : configMapError?.message || `Fetches configuration fields for ${testConnector}`
                }
              </div>
            </div>
            {getStatusBadge(configMapLoading, configMapFetching, configMapError, configMap)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <div className="font-medium">/connectors/{testConnector}/trading-rules API</div>
              <div className="text-sm text-muted-foreground">
                {tradingRules 
                  ? `Found trading rules for ${Object.keys(tradingRules).length} pairs`
                  : tradingRulesError?.message || `Fetches trading rules for ${testConnector}`
                }
              </div>
            </div>
            {getStatusBadge(tradingRulesLoading, tradingRulesFetching, tradingRulesError, tradingRules)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <div className="font-medium">/connectors/{testConnector}/order-types API</div>
              <div className="text-sm text-muted-foreground">
                {orderTypes 
                  ? `Found ${orderTypes.length} order types: ${orderTypes.join(', ')}`
                  : orderTypesError?.message || `Fetches supported order types for ${testConnector}`
                }
              </div>
            </div>
            {getStatusBadge(orderTypesLoading, orderTypesFetching, orderTypesError, orderTypes)}
          </div>
        </div>
        
        {(accountsError || connectorsError || configMapError || tradingRulesError || orderTypesError) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-sm text-red-800">
              <strong>Troubleshooting:</strong>
              <ul className="mt-1 list-disc list-inside">
                <li>Make sure Hummingbot API is running on localhost:8000</li>
                <li>Verify the credentials in the Health Status button (top-right corner)</li>
                <li>Check that the username and password are set to &lsquo;admin&rsquo; and &lsquo;admin&rsquo;</li>
                <li>For connector-specific APIs, ensure the connector name is valid (try &lsquo;binance&rsquo; or &lsquo;kucoin&rsquo;)</li>
                <li>Some connectors may not support all features (trading rules, order types, etc.)</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}