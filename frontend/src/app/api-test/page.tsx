'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { AuthTestComponent } from '@/components/auth/auth-test-component';
import { debugAuthState } from '@/lib/debug/auth-debug';
import { getBaseURLFromHealthMonitor } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

export default function ApiTestPage() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Capture console logs for display
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const logCapture = (...args: any[]) => {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
      setLogs(prev => [...prev, `[LOG] ${message}`]);
      originalLog(...args);
    };

    const errorCapture = (...args: any[]) => {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
      setLogs(prev => [...prev, `[ERROR] ${message}`]);
      originalError(...args);
    };

    const warnCapture = (...args: any[]) => {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
      setLogs(prev => [...prev, `[WARN] ${message}`]);
      originalWarn(...args);
    };

    console.log = logCapture;
    console.error = errorCapture;
    console.warn = warnCapture;

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const runDebugTest = () => {
    setLogs([]);
    console.log('Running auth debug test...');
    debugAuthState();
    
    const testApiCalls = async () => {
      try {
        console.log('Testing /accounts API call...');
        const baseURL = getBaseURLFromHealthMonitor();
        console.log('Using base URL:', baseURL);
        
        const accountsResponse = await fetch(`${baseURL}/accounts/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        console.log('/accounts without auth:', accountsResponse.status, accountsResponse.statusText);
        
        // Test with the API client (which should include auth)
        const { accountsApi } = await import('@/lib/api/accounts');
        const accounts = await accountsApi.listAccounts();
        console.log('Accounts API with auth successful:', accounts);
        
        const { connectorsApi } = await import('@/lib/api/connectors');
        const connectors = await connectorsApi.getAvailableConnectors();
        console.log('Connectors API with auth successful:', connectors?.length || 0, 'connectors found');
        
      } catch (error) {
        console.error('API test failed:', error);
      }
    };
    
    setTimeout(testApiCalls, 100);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">API Testing & Debugging</h1>
            <p className="text-muted-foreground mt-2">
              Test Hummingbot API authentication and connectivity
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={runDebugTest}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Debug Test
            </Button>
            <Button variant="outline" onClick={clearLogs}>
              Clear Logs
            </Button>
          </div>
        </div>

        {/* API Test Component */}
        <AuthTestComponent />

        {/* Debug Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Debug Console Logs
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Real-time console output from authentication and API tests
            </p>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-muted-foreground italic">No logs yet. Click &quot;Run Debug Test&quot; to start testing.</p>
              ) : (
                <div className="font-mono text-sm space-y-1">
                  {logs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`${
                        log.startsWith('[ERROR]') 
                          ? 'text-red-600 dark:text-red-400' 
                          : log.startsWith('[WARN]')
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Current Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Base URL</label>
                <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                  {typeof window !== 'undefined' ? getBaseURLFromHealthMonitor() : 'Loading...'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Health Monitor Status</label>
                <div className="mt-1">
                  {typeof window !== 'undefined' ? (
                    localStorage.getItem('healthMonitorSelectedUrl') ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Configured
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="w-3 h-3 mr-1" />
                        Not Configured
                      </Badge>
                    )
                  ) : (
                    <Badge variant="outline">Loading...</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}