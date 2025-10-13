'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { LightweightChart } from '@/components/charts/lightweight-chart';
import { HistoricalMarketDataForm, HistoricalMarketDataFormData } from '@/components/forms/historical-market-data-form';
import { CandleData } from '@/lib/api/market-data';
import { useFetchHistoricalCandles } from '@/lib/hooks/useMarketDataQuery';

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

// Helper function to format Unix timestamp to readable date
const formatUnixTime = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

// Helper function to format price with appropriate decimal places
const formatPrice = (price: number): string => {
  if (price < 0.01) return price.toFixed(6);
  if (price < 1) return price.toFixed(4);
  return price.toFixed(2);
};

export default function MarketDataPage() {
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentConfig, setCurrentConfig] = useState<HistoricalMarketDataFormData | null>(null);
  
  const fetchHistoricalCandlesMutation = useFetchHistoricalCandles();

  const handleFormSubmit = async (formData: HistoricalMarketDataFormData) => {
    setError(null);
    
    try {
      const response = await fetchHistoricalCandlesMutation.mutateAsync({
        connector_name: formData.connectorName,
        trading_pair: formData.tradingPair,
        interval: formData.interval,
        start_time: formData.startTime,
        end_time: formData.endTime,
      });
      
      if (response.data && Array.isArray(response.data)) {
        setChartData(response.data);
        setCurrentConfig(formData);
      } else {
        throw new Error('Invalid response format or no data returned');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch historical market data';
      setError(errorMessage);
      console.error('Historical market data fetch error:', err);
    }
  };

  // Calculate chart statistics
  const chartStats = chartData.length > 0 ? {
    totalRecords: chartData.length,
    firstCandle: chartData[0],
    lastCandle: chartData[chartData.length - 1],
    highPrice: Math.max(...chartData.map(d => d.high)),
    lowPrice: Math.min(...chartData.map(d => d.low)),
    totalVolume: chartData.reduce((sum, d) => sum + (d.volume || 0), 0),
    priceChange: chartData[chartData.length - 1]?.close - chartData[0]?.open,
    priceChangePercent: ((chartData[chartData.length - 1]?.close - chartData[0]?.open) / chartData[0]?.open) * 100
  } : null;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Historical Market Data</h1>
            <p className="text-muted-foreground">
              Analyze historical market data with interactive candlestick charts powered by TradingView
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Configuration Form */}
          <div className="lg:col-span-1">
            <HistoricalMarketDataForm 
              onSubmit={handleFormSubmit} 
              loading={fetchHistoricalCandlesMutation.isPending} 
            />
            
            {/* Current Configuration Display */}
            {currentConfig && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Current Chart
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connector:</span>
                    <span className="font-medium">{currentConfig.connectorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pair:</span>
                    <span className="font-medium">{currentConfig.tradingPair}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interval:</span>
                    <span className="font-medium">{currentConfig.interval}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="text-xs text-muted-foreground">Time Range:</div>
                    <div className="text-xs">{formatUnixTime(currentConfig.startTime)}</div>
                    <div className="text-xs">to {formatUnixTime(currentConfig.endTime)}</div>
                  </div>
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
                    ? `${currentConfig.tradingPair} - ${currentConfig.connectorName} (${currentConfig.interval})`
                    : 'Historical Market Chart'
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Loading State */}
                {fetchHistoricalCandlesMutation.isPending && (
                  <div className="flex items-center justify-center h-96">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Loading historical data...</span>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && !fetchHistoricalCandlesMutation.isPending && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Chart Display */}
                {!fetchHistoricalCandlesMutation.isPending && !error && chartData.length > 0 && (
                  <div className="space-y-4">
                    <LightweightChart 
                      data={chartData} 
                      height={500}
                      className="w-full border rounded-md"
                    />
                    
                    {/* Chart Statistics */}
                    {chartStats && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                        <div className="bg-muted p-3 rounded-md">
                          <div className="text-muted-foreground text-xs">Records</div>
                          <div className="font-semibold">{chartStats.totalRecords.toLocaleString()}</div>
                        </div>
                        <div className="bg-muted p-3 rounded-md">
                          <div className="text-muted-foreground text-xs">Latest Price</div>
                          <div className="font-semibold">${formatPrice(chartStats.lastCandle.close)}</div>
                        </div>
                        <div className="bg-muted p-3 rounded-md">
                          <div className="text-muted-foreground text-xs">High</div>
                          <div className="font-semibold text-green-600">${formatPrice(chartStats.highPrice)}</div>
                        </div>
                        <div className="bg-muted p-3 rounded-md">
                          <div className="text-muted-foreground text-xs">Low</div>
                          <div className="font-semibold text-red-600">${formatPrice(chartStats.lowPrice)}</div>
                        </div>
                        <div className="bg-muted p-3 rounded-md">
                          <div className="text-muted-foreground text-xs">Change</div>
                          <div className={`font-semibold ${chartStats.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {chartStats.priceChange >= 0 ? '+' : ''}${formatPrice(chartStats.priceChange)}
                          </div>
                        </div>
                        <div className="bg-muted p-3 rounded-md">
                          <div className="text-muted-foreground text-xs">Change %</div>
                          <div className={`font-semibold ${chartStats.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {chartStats.priceChangePercent >= 0 ? '+' : ''}{chartStats.priceChangePercent.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Additional Data Info */}
                    {chartStats && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Data Range: {formatUnixTime(chartStats.firstCandle.timestamp)} - {formatUnixTime(chartStats.lastCandle.timestamp)}</div>
                        <div>Total Volume: {chartStats.totalVolume.toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Empty State */}
                {!fetchHistoricalCandlesMutation.isPending && !error && chartData.length === 0 && (
                  <div className="flex items-center justify-center h-96 text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No Data Available</p>
                      <p>Configure the parameters and click &ldquo;Load Historical Data&rdquo; to view market data</p>
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