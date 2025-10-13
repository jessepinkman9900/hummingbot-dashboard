'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { LightweightChart } from '@/components/charts/lightweight-chart';
import { MarketDataForm, MarketDataFormData } from '@/components/forms/market-data-form';
import { CandleData } from '@/lib/api/market-data';
import { useFetchCandles } from '@/lib/hooks/useMarketDataQuery';

// Create a simple Alert component since it doesn't exist
function Alert({ variant, children }: { variant?: 'destructive'; children: React.ReactNode }) {
  return (
    <div className={`rounded-md border p-4 ${variant === 'destructive' ? 'border-red-200 bg-red-50 text-red-900' : 'border-gray-200 bg-gray-50'}`}>
      {children}
    </div>
  );
}

function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div className="text-sm">{children}</div>;
}

export default function MarketDataPage() {
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentConfig, setCurrentConfig] = useState<MarketDataFormData | null>(null);
  
  const fetchCandlesMutation = useFetchCandles();

  const handleFormSubmit = async (formData: MarketDataFormData) => {
    setError(null);
    
    try {
      const response = await fetchCandlesMutation.mutateAsync({
        connector: formData.connector,
        trading_pair: formData.tradingPair,
        interval: formData.interval,
        max_records: formData.maxRecords,
      });
      
      if (response.data && response.data.candles) {
        setChartData(response.data.candles);
        setCurrentConfig(formData);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch chart data';
      setError(errorMessage);
      console.error('Market data fetch error:', err);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Market Data Analysis</h1>
            <p className="text-muted-foreground">
              Visualize real-time market data with interactive charts
            </p>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Configuration Form */}
        <div className="lg:col-span-1">
          <MarketDataForm onSubmit={handleFormSubmit} loading={fetchCandlesMutation.isPending} />
          
          {/* Current Configuration Display */}
          {currentConfig && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Current Chart</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div><strong>Exchange:</strong> {currentConfig.connector}</div>
                <div><strong>Pair:</strong> {currentConfig.tradingPair}</div>
                <div><strong>Interval:</strong> {currentConfig.interval}</div>
                <div><strong>Records:</strong> {currentConfig.maxRecords}</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Chart Display */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {currentConfig 
                  ? `${currentConfig.tradingPair} - ${currentConfig.connector} (${currentConfig.interval})`
                  : 'Market Chart'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Loading State */}
              {fetchCandlesMutation.isPending && (
                <div className="flex items-center justify-center h-96">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading chart data...</span>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !fetchCandlesMutation.isPending && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Chart Display */}
              {!fetchCandlesMutation.isPending && !error && chartData.length > 0 && (
                <div className="space-y-4">
                  <LightweightChart 
                    data={chartData} 
                    height={500}
                    className="w-full border rounded-md"
                  />
                  
                  {/* Chart Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-muted p-3 rounded-md">
                      <div className="text-muted-foreground">Total Records</div>
                      <div className="font-semibold">{chartData.length}</div>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <div className="text-muted-foreground">Latest Price</div>
                      <div className="font-semibold">
                        ${chartData[chartData.length - 1]?.close?.toFixed(2) || 'N/A'}
                      </div>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <div className="text-muted-foreground">High</div>
                      <div className="font-semibold">
                        ${Math.max(...chartData.map(d => d.high)).toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <div className="text-muted-foreground">Low</div>
                      <div className="font-semibold">
                        ${Math.min(...chartData.map(d => d.low)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!fetchCandlesMutation.isPending && !error && chartData.length === 0 && (
                <div className="flex items-center justify-center h-96 text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select configuration and click &ldquo;Load Chart Data&rdquo; to view market data</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </MainLayout>
  );
}