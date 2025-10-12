'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useAccounts } from '@/lib/hooks/useAccountsQuery';
import { useAvailableConnectors } from '@/lib/hooks/useConnectorsQuery';

export function AuthTestComponent() {
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

  const testAllAPIs = async () => {
    await Promise.all([
      refetchAccounts(),
      refetchConnectors()
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
        <div className="flex gap-2">
          <Button onClick={testAllAPIs}>Test All APIs</Button>
          <Button variant="outline" onClick={() => refetchAccounts()}>Test Accounts</Button>
          <Button variant="outline" onClick={() => refetchConnectors()}>Test Connectors</Button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
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
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
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
        </div>
        
        {(accountsError || connectorsError) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-800">
              <strong>Troubleshooting:</strong>
              <ul className="mt-1 list-disc list-inside">
                <li>Make sure Hummingbot API is running on localhost:8000</li>
                <li>Verify the credentials in the Health Status button (top-right corner)</li>
                <li>Check that the username and password are set to 'admin' and 'admin'</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}