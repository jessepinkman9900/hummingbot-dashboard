'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  storeBasicAuthCredentials, 
  getStoredBasicAuthCredentials, 
  clearStoredBasicAuthCredentials 
} from '@/lib/api/client';
import { toast } from 'sonner';

export function CredentialTest() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [storedCredentials, setStoredCredentials] = useState<{username: string; password: string} | null>(null);

  const handleStore = () => {
    if (username.trim() && password.trim()) {
      storeBasicAuthCredentials(username.trim(), password.trim());
      toast.success('Credentials stored!');
      setUsername('');
      setPassword('');
    } else {
      toast.error('Please enter both username and password');
    }
  };

  const handleRetrieve = () => {
    const credentials = getStoredBasicAuthCredentials();
    setStoredCredentials(credentials);
    if (credentials) {
      toast.success('Credentials retrieved!');
    } else {
      toast.error('No credentials found');
    }
  };

  const handleClear = () => {
    clearStoredBasicAuthCredentials();
    setStoredCredentials(null);
    toast.success('Credentials cleared!');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Credential Storage Test</CardTitle>
        <CardDescription>
          Test storing and retrieving basic auth credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Store Credentials */}
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>

        <Button onClick={handleStore} className="w-full">
          Store Credentials
        </Button>

        <hr />

        {/* Retrieve and Display */}
        <div className="flex gap-2">
          <Button onClick={handleRetrieve} variant="outline" className="flex-1">
            Retrieve
          </Button>
          <Button onClick={handleClear} variant="destructive" className="flex-1">
            Clear
          </Button>
        </div>

        {/* Display stored credentials */}
        {storedCredentials && (
          <div className="p-3 bg-muted rounded-md">
            <h4 className="text-sm font-medium mb-2">Stored Credentials:</h4>
            <div className="text-sm space-y-1">
              <div><strong>Username:</strong> {storedCredentials.username}</div>
              <div><strong>Password:</strong> {storedCredentials.password}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}