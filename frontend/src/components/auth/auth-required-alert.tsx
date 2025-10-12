'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Settings } from 'lucide-react';

interface AuthRequiredAlertProps {
  onConfigureClick: () => void;
}

export function AuthRequiredAlert({ onConfigureClick }: AuthRequiredAlertProps) {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Check if auth credentials are configured
    if (typeof window !== 'undefined') {
      try {
        const selectedUrlId = localStorage.getItem('healthMonitorSelectedUrl');
        const savedUrls = localStorage.getItem('healthMonitorUrls');

        if (selectedUrlId && savedUrls) {
          const urls = JSON.parse(savedUrls);
          const selectedUrl = urls.find((url: any) => url.id === selectedUrlId);
          
          // Show alert if no credentials are configured
          if (!selectedUrl?.username || !selectedUrl?.password) {
            setShowAlert(true);
          } else {
            setShowAlert(false);
          }
        } else {
          setShowAlert(true);
        }
      } catch (error) {
        console.warn('Error checking auth configuration:', error);
        setShowAlert(true);
      }
    }
  }, []);

  if (!showAlert) return null;

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <div className="flex items-center justify-between">
          <div>
            <strong>Authentication Required:</strong> Please configure your Hummingbot API credentials in the health monitor to access portfolio data.
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onConfigureClick}
            className="ml-4 border-amber-300 text-amber-800 hover:bg-amber-100"
          >
            <Settings className="h-3 w-3 mr-1" />
            Configure
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}