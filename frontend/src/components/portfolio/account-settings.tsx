'use client';

import { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/combobox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAccountCredentials, useAddCredential, useDeleteCredential } from '@/lib/hooks/useAccountsQuery';
import { useAvailableConnectors } from '@/lib/hooks/useConnectorsQuery';

interface AccountSettingsProps {
  accountName: string;
  onBack: () => void;
}

export function AccountSettings({ accountName, onBack }: AccountSettingsProps) {
  const { data: accountCredentials = [], isLoading: loadingCredentials, error: credentialsError } = useAccountCredentials(accountName);
  const { data: availableConnectors = [] } = useAvailableConnectors();
  const addCredentialMutation = useAddCredential();
  const deleteCredentialMutation = useDeleteCredential();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<string>('');
  const [credentialFields, setCredentialFields] = useState<Record<string, string>>({});
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get available connectors that don't already have credentials
  const availableNewConnectors = availableConnectors.filter(
    connector => !accountCredentials.includes(connector)
  );

  const handleAddCredential = async () => {
    if (!selectedConnector || Object.keys(credentialFields).length === 0) {
      toast.error('Please select a connector and fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addCredentialMutation.mutateAsync({
        accountName,
        connectorName: selectedConnector,
        credentials: credentialFields
      });
      setShowAddDialog(false);
      setSelectedConnector('');
      setCredentialFields({});
    } catch (error) {
      // Error handling is done by the mutation's onError callback
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCredential = async (connectorName: string) => {
    try {
      await deleteCredentialMutation.mutateAsync({
        accountName,
        connectorName
      });
    } catch (error) {
      // Error handling is done by the mutation's onError callback
    }
  };

  const handleConnectorChange = (connector: string) => {
    setSelectedConnector(connector);
    // Reset credential fields and set common fields for the connector
    const commonFields = getConnectorFields(connector);
    setCredentialFields(
      commonFields.reduce((acc, field) => ({ ...acc, [field]: '' }), {})
    );
  };

  const getConnectorFields = (connector: string): string[] => {
    // Common credential fields for different connector types
    const commonFields = ['api_key', 'secret_key'];
    
    // Some exchanges require additional fields
    if (['kucoin', 'okex', 'gate_io'].includes(connector)) {
      return [...commonFields, 'passphrase'];
    }
    
    return commonFields;
  };

  const formatFieldName = (fieldName: string): string => {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const toggleCredentialVisibility = (connector: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [connector]: !prev[connector]
    }));
  };

  if (credentialsError) {
    return (
      <Alert>
        <AlertDescription>
          {credentialsError.message || 'Failed to load credentials'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-muted-foreground">
              Manage credentials for {accountName}
            </p>
          </div>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button disabled={availableNewConnectors.length === 0}>
              <Plus className="h-4 w-4" />
              Add Credential
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Credential</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="connector">Connector</Label>
                <SearchableSelect
                  options={availableNewConnectors.map(connector => ({
                    value: connector,
                    label: connector
                  }))}
                  value={selectedConnector}
                  onValueChange={handleConnectorChange}
                  placeholder="Search and select a connector"
                  emptyMessage="No connectors found"
                />
              </div>
              
              {selectedConnector && (
                <div className="space-y-3">
                  {getConnectorFields(selectedConnector).map((field) => (
                    <div key={field}>
                      <Label htmlFor={field}>{formatFieldName(field)}</Label>
                      <Input
                        id={field}
                        type="password"
                        value={credentialFields[field] || ''}
                        onChange={(e) => setCredentialFields(prev => ({
                          ...prev,
                          [field]: e.target.value
                        }))}
                        placeholder={`Enter your ${formatFieldName(field).toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCredential}
                  disabled={!selectedConnector || isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Credential'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Credentials List */}
      <Card>
        <CardHeader>
          <CardTitle>Exchange Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCredentials ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[120px]" />
                      <Skeleton className="h-3 w-[80px]" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : accountCredentials.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No credentials configured</p>
              <p className="text-sm text-muted-foreground mb-4">
                Add exchange API credentials to enable trading with this account
              </p>
              {availableNewConnectors.length > 0 ? (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Credential
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  All available connectors are already configured
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {accountCredentials.map((connector) => (
                <div key={connector} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-md flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {connector.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{connector}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          Connected
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {showCredentials[connector] ? 'Credentials visible' : 'Credentials hidden'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCredentialVisibility(connector)}
                    >
                      {showCredentials[connector] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCredential(connector)}
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

      {availableNewConnectors.length === 0 && accountCredentials.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                All available connectors have been configured for this account.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}