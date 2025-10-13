'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchableSelect } from '@/components/ui/combobox';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus } from 'lucide-react';
import { useAvailableConnectors, useConnectorConfigMap } from '@/lib/hooks/useConnectorsQuery';
import { useAddCredential } from '@/lib/hooks/useAccountsQuery';
import { toast } from 'sonner';

interface AddCredentialDialogProps {
  accountName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCredentialDialog({ accountName, open, onOpenChange }: AddCredentialDialogProps) {
  const [selectedConnector, setSelectedConnector] = useState<string>('');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  
  const { 
    data: connectors = [], 
    isLoading: connectorsLoading, 
    error: connectorsError 
  } = useAvailableConnectors();
  
  const { 
    data: configMap = [], 
    isLoading: configLoading, 
    error: configError 
  } = useConnectorConfigMap(selectedConnector, !!selectedConnector);

  const addCredentialMutation = useAddCredential();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedConnector('');
      setCredentials({});
    }
  }, [open]);

  // Reset credentials when connector changes
  useEffect(() => {
    if (selectedConnector) {
      setCredentials({});
    }
  }, [selectedConnector]);

  const handleConnectorChange = (value: string) => {
    setSelectedConnector(value);
  };

  const handleCredentialChange = (fieldName: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedConnector) {
      toast.error('Please select a connector');
      return;
    }

    // Check if all fields are filled (treating all as required for now)
    for (const fieldName of configMap) {
      if (!credentials[fieldName] || credentials[fieldName].trim() === '') {
        toast.error(`Please fill in the required field: ${fieldName}`);
        return;
      }
    }

    try {
      await addCredentialMutation.mutateAsync({
        accountName,
        connectorName: selectedConnector,
        credentials,
      });
      
      // Close dialog and reset form on success
      onOpenChange(false);
      setSelectedConnector('');
      setCredentials({});
    } catch (error) {
      console.error('Failed to add credential:', error);
    }
  };

  const renderConfigFields = () => {
    if (!selectedConnector) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Please select a connector to see configuration fields
        </div>
      );
    }

    if (configLoading) {
      return (
        <div className="space-y-4">
          <div className="text-sm font-medium">Loading configuration fields...</div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      );
    }

    if (configError) {
      return (
        <Alert>
          <AlertDescription>
            Failed to load configuration for {selectedConnector}. Please try again.
          </AlertDescription>
        </Alert>
      );
    }

    if (!configMap || configMap.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No configuration fields found for {selectedConnector}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-sm font-medium text-muted-foreground mb-4">
          Configure {selectedConnector} credentials:
        </div>
        {configMap.map((fieldName) => {
          // The API returns an array of field names as strings
          const isPasswordField = fieldName.toLowerCase().includes('secret') || 
                                  fieldName.toLowerCase().includes('password') || 
                                  fieldName.toLowerCase().includes('key');

          return (
            <div key={fieldName} className="space-y-2">
              <Label htmlFor={fieldName} className="flex items-center gap-2">
                {fieldName}
                <Badge variant="destructive" className="text-xs">Required</Badge>
              </Label>
              <Input
                id={fieldName}
                type={isPasswordField ? 'password' : 'text'}
                placeholder={`Enter ${fieldName}`}
                value={credentials[fieldName] || ''}
                onChange={(e) => handleCredentialChange(fieldName, e.target.value)}
                required
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Credential for {accountName}</DialogTitle>
          <DialogDescription>
            Select a connector and configure its credentials for this account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Select Connector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="secondary">1</Badge>
                Select Connector
              </CardTitle>
            </CardHeader>
            <CardContent>
              {connectorsError ? (
                <Alert>
                  <AlertDescription>
                    Failed to load available connectors. Please try again.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="connector">Available Connectors</Label>
                  <SearchableSelect
                    options={connectors.map(connector => ({
                      value: connector,
                      label: connector
                    }))}
                    value={selectedConnector}
                    onValueChange={handleConnectorChange}
                    disabled={connectorsLoading}
                    placeholder={
                      connectorsLoading 
                        ? "Loading connectors..." 
                        : "Search and select a connector"
                    }
                    emptyMessage="No connectors found"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Configure Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="secondary">2</Badge>
                Configure Credentials
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderConfigFields()}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={addCredentialMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !selectedConnector || 
                addCredentialMutation.isPending ||
                configLoading ||
                connectorsLoading
              }
            >
              {addCredentialMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Credential
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}