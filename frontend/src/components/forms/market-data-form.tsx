'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { marketDataApi } from '@/lib/api/market-data';

export interface MarketDataFormData {
  connector: string;
  tradingPair: string;
  interval: string;
  maxRecords: number;
}

interface MarketDataFormProps {
  onSubmit: (data: MarketDataFormData) => void;
  loading?: boolean;
}

const INTERVALS = [
  { value: '1m', label: '1 minute' },
  { value: '5m', label: '5 minutes' },
  { value: '15m', label: '15 minutes' },
  { value: '30m', label: '30 minutes' },
  { value: '1h', label: '1 hour' },
  { value: '4h', label: '4 hours' },
  { value: '1d', label: '1 day' },
];

const COMMON_PAIRS = [
  'BTC-USDT',
  'ETH-USDT',
  'BNB-USDT',
  'ADA-USDT',
  'SOL-USDT',
  'DOGE-USDT',
  'MATIC-USDT',
  'DOT-USDT',
];

export function MarketDataForm({ onSubmit, loading = false }: MarketDataFormProps) {
  const [formData, setFormData] = useState<MarketDataFormData>({
    connector: '',
    tradingPair: '',
    interval: '1h',
    maxRecords: 100,
  });
  
  const [availableConnectors, setAvailableConnectors] = useState<string[]>([]);
  const [loadingConnectors, setLoadingConnectors] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadConnectors = async () => {
      try {
        setLoadingConnectors(true);
        const response = await marketDataApi.getAvailableConnectors();
        setAvailableConnectors(response.data);
      } catch (error) {
        console.error('Failed to load connectors:', error);
        // Fallback to common connectors
        setAvailableConnectors(['binance', 'coinbase_pro', 'kraken', 'kucoin']);
      } finally {
        setLoadingConnectors(false);
      }
    };

    loadConnectors();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.connector) {
      newErrors.connector = 'Please select a connector';
    }

    if (!formData.tradingPair) {
      newErrors.tradingPair = 'Please enter a trading pair';
    }

    if (!formData.interval) {
      newErrors.interval = 'Please select an interval';
    }

    if (formData.maxRecords < 1 || formData.maxRecords > 1000) {
      newErrors.maxRecords = 'Records must be between 1 and 1000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof MarketDataFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Market Data Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Connector Selection */}
          <div className="space-y-2">
            <Label htmlFor="connector">Exchange Connector</Label>
            <Select
              value={formData.connector}
              onValueChange={(value) => handleInputChange('connector', value)}
              disabled={loadingConnectors}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingConnectors ? "Loading..." : "Select connector"} />
              </SelectTrigger>
              <SelectContent>
                {availableConnectors.map((connector) => (
                  <SelectItem key={connector} value={connector}>
                    {connector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.connector && (
              <p className="text-sm text-red-600">{errors.connector}</p>
            )}
          </div>

          {/* Trading Pair */}
          <div className="space-y-2">
            <Label htmlFor="tradingPair">Trading Pair</Label>
            <Select
              value={formData.tradingPair}
              onValueChange={(value) => handleInputChange('tradingPair', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select or type trading pair" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_PAIRS.map((pair) => (
                  <SelectItem key={pair} value={pair}>
                    {pair}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id="tradingPair"
              type="text"
              placeholder="e.g., BTC-USDT"
              value={formData.tradingPair}
              onChange={(e) => handleInputChange('tradingPair', e.target.value.toUpperCase())}
            />
            {errors.tradingPair && (
              <p className="text-sm text-red-600">{errors.tradingPair}</p>
            )}
          </div>

          {/* Time Interval */}
          <div className="space-y-2">
            <Label htmlFor="interval">Time Interval</Label>
            <Select
              value={formData.interval}
              onValueChange={(value) => handleInputChange('interval', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                {INTERVALS.map((interval) => (
                  <SelectItem key={interval.value} value={interval.value}>
                    {interval.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.interval && (
              <p className="text-sm text-red-600">{errors.interval}</p>
            )}
          </div>

          {/* Max Records */}
          <div className="space-y-2">
            <Label htmlFor="maxRecords">Number of Records</Label>
            <Input
              id="maxRecords"
              type="number"
              min="1"
              max="1000"
              value={formData.maxRecords}
              onChange={(e) => handleInputChange('maxRecords', parseInt(e.target.value) || 100)}
            />
            {errors.maxRecords && (
              <p className="text-sm text-red-600">{errors.maxRecords}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Loading Chart...' : 'Load Chart Data'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}