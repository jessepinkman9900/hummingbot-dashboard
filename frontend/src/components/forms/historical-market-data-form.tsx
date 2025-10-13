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
import { SearchableSelect } from '@/components/ui/combobox';
import { Building2, Calendar, Clock } from 'lucide-react';
import { useAvailableConnectors, useTradingRules } from '@/lib/hooks/useMarketDataQuery';

export interface HistoricalMarketDataFormData {
  connectorName: string;
  tradingPair: string;
  interval: string;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
}

interface HistoricalMarketDataFormProps {
  onSubmit: (data: HistoricalMarketDataFormData) => void;
  loading?: boolean;
}

const INTERVALS = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
  { value: '1d', label: '1d' },
];

// Helper function to convert date-time string to Unix timestamp
const dateTimeToUnix = (dateTimeString: string): number => {
  return Math.floor(new Date(dateTimeString).getTime() / 1000);
};

// Helper function to convert Unix timestamp to date-time string for input
const unixToDateTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  // Format as YYYY-MM-DDTHH:MM for datetime-local input
  return date.toISOString().slice(0, 16);
};

// Get default start time (1 day ago) and end time (now)
const getDefaultTimeRange = () => {
  const now = Math.floor(Date.now() / 1000);
  const oneDayAgo = now - (24 * 60 * 60);
  return {
    startTime: oneDayAgo,
    endTime: now
  };
};

export function HistoricalMarketDataForm({ onSubmit, loading = false }: HistoricalMarketDataFormProps) {
  const defaultTimes = getDefaultTimeRange();
  
  const [formData, setFormData] = useState<HistoricalMarketDataFormData>({
    connectorName: '',
    tradingPair: '',
    interval: '1m',
    startTime: defaultTimes.startTime,
    endTime: defaultTimes.endTime,
  });
  
  // API hooks
  const { 
    data: availableConnectors = [], 
    isLoading: loadingConnectors, 
    error: connectorsError 
  } = useAvailableConnectors();

  const {
    data: tradingRulesData = {},
    isLoading: loadingTradingRules,
    error: tradingRulesError
  } = useTradingRules(formData.connectorName, !!formData.connectorName);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Extract trading pairs from trading rules
  const availableTradingPairs = Object.keys(tradingRulesData || {});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.connectorName) {
      newErrors.connectorName = 'Please select a connector';
    }

    if (!formData.tradingPair) {
      newErrors.tradingPair = 'Please select a trading pair';
    }

    if (!formData.interval) {
      newErrors.interval = 'Please select an interval';
    }

    if (formData.startTime >= formData.endTime) {
      newErrors.startTime = 'Start time must be before end time';
    }

    // Check if time range is not too large (e.g., max 30 days for 1m interval)
    const timeDiff = formData.endTime - formData.startTime;
    const maxDays = formData.interval === '1m' ? 7 : 
                    formData.interval === '5m' ? 30 : 
                    formData.interval === '15m' ? 90 : 365;
    const maxSeconds = maxDays * 24 * 60 * 60;
    
    if (timeDiff > maxSeconds) {
      newErrors.endTime = `Time range too large for ${formData.interval} interval. Max ${maxDays} days.`;
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

  const handleInputChange = (field: keyof HistoricalMarketDataFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts changing values
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Reset trading pair when connector changes
  useEffect(() => {
    if (formData.connectorName) {
      setFormData(prev => ({ ...prev, tradingPair: '' }));
    }
  }, [formData.connectorName]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Historical Market Data Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Horizontal Layout for All Fields Including Submit Button */}
          <div className="flex flex-wrap items-end gap-4">
            {/* Connector Selection */}
            <div className="space-y-2">
              <Label htmlFor="connector" className="flex items-center gap-2 h-5">
                <Building2 className="h-4 w-4" />
                Connector
              </Label>
              <SearchableSelect
                value={formData.connectorName}
                onValueChange={(value) => handleInputChange('connectorName', value)}
                placeholder={loadingConnectors ? "Loading connectors..." : "Search connector..."}
                disabled={loadingConnectors}
                options={(availableConnectors || []).map(connector => ({ value: connector, label: connector }))}
                emptyMessage="No connectors available"
                tabIndex={1}
                className="w-48"
              />
              <div className="min-h-[1.25rem]">
                {errors.connectorName && (
                  <p className="text-sm text-red-600">{errors.connectorName}</p>
                )}
                {connectorsError && (
                  <p className="text-sm text-amber-600">
                    Failed to load connectors
                  </p>
                )}
              </div>
            </div>

            {/* Trading Pair Selection */}
            <div className="space-y-2">
              <Label htmlFor="tradingPair" className="h-5">Trading Pair</Label>
              <SearchableSelect
                value={formData.tradingPair}
                onValueChange={(value) => handleInputChange('tradingPair', value)}
                placeholder={
                  !formData.connectorName ? "Select connector first" :
                  loadingTradingRules ? "Loading pairs..." : 
                  "Search trading pair..."
                }
                disabled={!formData.connectorName || loadingTradingRules}
                options={(availableTradingPairs || []).map(pair => ({ value: pair, label: pair }))}
                emptyMessage="No trading pairs available"
                tabIndex={2}
                className="w-40"
              />
              <div className="min-h-[1.25rem]">
                {errors.tradingPair && (
                  <p className="text-sm text-red-600">{errors.tradingPair}</p>
                )}
                {loadingTradingRules && formData.connectorName && (
                  <p className="text-sm text-muted-foreground">Loading trading pairs...</p>
                )}
                {tradingRulesError && formData.connectorName && (
                  <p className="text-sm text-amber-600">
                    Failed to load trading pairs
                  </p>
                )}
              </div>
            </div>

            {/* Time Interval */}
            <div className="space-y-2">
              <Label htmlFor="interval" className="flex items-center gap-2 h-5">
                <Clock className="h-4 w-4" />
                Interval
              </Label>
              <Select
                value={formData.interval}
                onValueChange={(value) => handleInputChange('interval', value)}
              >
                <SelectTrigger tabIndex={3} className="w-20 justify-between text-left font-normal">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {INTERVALS.map((interval) => (
                    <SelectItem key={interval.value} value={interval.value}>
                      {interval.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="min-h-[1.25rem]">
                {errors.interval && (
                  <p className="text-sm text-red-600">{errors.interval}</p>
                )}
              </div>
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-2 h-5">
                <Calendar className="h-4 w-4" />
                Start Time
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                tabIndex={4}
                className="h-10 w-52"
                value={unixToDateTime(formData.startTime)}
                onChange={(e) => {
                  const unixTime = dateTimeToUnix(e.target.value);
                  handleInputChange('startTime', unixTime);
                }}
              />
              <div className="min-h-[1.25rem]">
                {errors.startTime && (
                  <p className="text-sm text-red-600">{errors.startTime}</p>
                )}
              </div>
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="endTime" className="h-5">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                tabIndex={5}
                className="h-10 w-52"
                value={unixToDateTime(formData.endTime)}
                onChange={(e) => {
                  const unixTime = dateTimeToUnix(e.target.value);
                  handleInputChange('endTime', unixTime);
                }}
              />
              <div className="min-h-[1.25rem]">
                {errors.endTime && (
                  <p className="text-sm text-red-600">{errors.endTime}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-2 ml-auto">
              <Label className="h-5">&nbsp;</Label> {/* Empty label for alignment */}
              <Button 
                type="submit" 
                tabIndex={6}
                disabled={loading || !formData.connectorName || !formData.tradingPair}
                className="h-10"
              >
                {loading ? 'Loading Chart...' : 'Load Historical Data'}
              </Button>
              <div className="min-h-[1.25rem]"></div> {/* Empty space for alignment with error message areas */}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}