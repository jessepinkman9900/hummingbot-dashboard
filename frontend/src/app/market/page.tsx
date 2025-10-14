'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ChartCandlestick, Download } from 'lucide-react';
import { LightweightChart } from '@/components/charts/lightweight-chart';
import { HistoricalMarketDataForm, HistoricalMarketDataFormData } from '@/components/forms/historical-market-data-form';
import { CandleData } from '@/lib/api/market-data';
import { useFetchHistoricalCandles } from '@/lib/hooks/useMarketDataQuery';
import { toast } from 'sonner';

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
// const formatUnixTime = (timestamp: number): string => {
//   return new Date(timestamp * 1000).toLocaleString();
// };

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

  // Convert candle data to CSV format and download
  const handleDownload = () => {
    if (!chartData.length || !currentConfig) {
      toast.error('No data available to download');
      return;
    }

    // Create CSV header
    const csvHeaders = [
      'timestamp',
      'open',
      'high',
      'low',
      'close',
      'volume',
      'quote_asset_volume',
      'n_trades',
      'taker_buy_base_volume',
      'taker_buy_quote_volume'
    ];

    // Convert data to CSV rows
    const csvRows = chartData.map(candle => [
      candle.timestamp,
      candle.open,
      candle.high,
      candle.low,
      candle.close,
      candle.volume || 0,
      candle.quote_asset_volume || 0,
      candle.n_trades || 0,
      candle.taker_buy_base_volume || 0,
      candle.taker_buy_quote_volume || 0
    ]);

    // Combine headers and rows
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.join(','))
      .join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Format filename: {connector_name}_{trading_pair}_{start_unixtime}_{end_unix_time}_{interval}.csv
    const filename = `${currentConfig.connectorName}_${currentConfig.tradingPair}_${currentConfig.startTime}_${currentConfig.endTime}_${currentConfig.interval}.csv`;
    a.download = filename;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Market data downloaded successfully');
  };

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
  const chartStats = chartData.length > 0 ? (() => {
    // Sort data by timestamp for consistent first/last calculations
    const sortedData = [...chartData].sort((a, b) => a.timestamp - b.timestamp);
    return {
      totalRecords: sortedData.length,
      firstCandle: sortedData[0],
      lastCandle: sortedData[sortedData.length - 1],
      highPrice: Math.max(...sortedData.map(d => d.high)),
      lowPrice: Math.min(...sortedData.map(d => d.low)),
      totalVolume: sortedData.reduce((sum, d) => sum + (d.volume || 0), 0),
      priceChange: sortedData[sortedData.length - 1]?.close - sortedData[0]?.open,
      priceChangePercent: ((sortedData[sortedData.length - 1]?.close - sortedData[0]?.open) / sortedData[0]?.open) * 100
    };
  })() : null;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center space-x-2">
          <ChartCandlestick className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Historical Market Data</h1>
            <p className="text-muted-foreground">
              Analyze historical market data with interactive candlestick charts powered by TradingView
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Configuration Form - Now Horizontal */}
          <HistoricalMarketDataForm 
            onSubmit={handleFormSubmit} 
            loading={fetchHistoricalCandlesMutation.isPending} 
          />

          {/* Chart Display */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {currentConfig 
                      ? `${currentConfig.tradingPair} - ${currentConfig.connectorName} (${currentConfig.interval})`
                      : 'Historical Market Chart'
                    }
                  </CardTitle>
                  {chartData.length > 0 && currentConfig && (
                    <Button onClick={handleDownload} variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV
                    </Button>
                  )}
                </div>
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

                {/* Market Data Statistics */}
                {!fetchHistoricalCandlesMutation.isPending && !error && chartData.length > 0 && (
                  <div className="space-y-4">
                    {/* Market Statistics */}
                    {chartStats && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="bg-muted p-2 rounded-md">
                          <div className="text-muted-foreground text-xs">Current Price</div>
                          <div className="font-semibold flex items-center gap-2">
                            ${formatPrice(chartStats.lastCandle.close)}
                            <span className={`text-xs font-medium ${chartStats.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {chartStats.priceChangePercent >= 0 ? '+' : ''}{chartStats.priceChangePercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                        <div className="bg-muted p-2 rounded-md">
                          <div className="text-muted-foreground text-xs">Volume</div>
                          <div className="font-semibold">{chartStats.totalVolume.toLocaleString()}</div>
                        </div>
                        <div className="bg-muted p-2 rounded-md">
                          <div className="text-muted-foreground text-xs">High</div>
                          <div className="font-semibold text-green-600">${formatPrice(chartStats.highPrice)}</div>
                        </div>
                        <div className="bg-muted p-2 rounded-md">
                          <div className="text-muted-foreground text-xs">Low</div>
                          <div className="font-semibold text-red-600">${formatPrice(chartStats.lowPrice)}</div>
                        </div>
                      </div>
                    )}

                    {/* Interactive Chart */}
                    <LightweightChart 
                      data={chartData} 
                      height={500}
                      className="w-full border rounded-md"
                      legend={currentConfig ? {
                        exchange: currentConfig.connectorName,
                        pair: currentConfig.tradingPair,
                        dateRange: `${new Date(currentConfig.startTime * 1000).toLocaleDateString()} - ${new Date(currentConfig.endTime * 1000).toLocaleDateString()}`
                      } : undefined}
                    />
                  </div>
                )}

                {/* Empty State */}
                {!fetchHistoricalCandlesMutation.isPending && !error && chartData.length === 0 && (
                  <div className="flex items-center justify-center h-96 text-muted-foreground">
                    <div className="text-center">
                      <ChartCandlestick className="h-12 w-12 mx-auto mb-4 opacity-50" />
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