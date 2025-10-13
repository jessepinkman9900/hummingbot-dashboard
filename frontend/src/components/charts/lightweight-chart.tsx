'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  createChart, 
  IChartApi, 
  ISeriesApi,
  UTCTimestamp,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  CandlestickData,
  LineData,
  HistogramData,
  CrosshairMode,
  MouseEventParams
} from 'lightweight-charts';
import { CandleData } from '@/lib/api/market-data';
import { Button } from '@/components/ui/button';
import { BarChart, TrendingUp } from 'lucide-react';

interface LegendInfo {
  exchange?: string;
  pair?: string;
  dateRange?: string;
}

interface LightweightChartProps {
  data: CandleData[];
  width?: number;
  height?: number;
  className?: string;
  legend?: LegendInfo;
}

type ChartType = 'candlestick' | 'line';

export function LightweightChart({ 
  data, 
  width = 800, 
  height = 400, 
  className,
  legend
}: LightweightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [crosshairPrice, setCrosshairPrice] = useState<string>('');
  const [tooltipData, setTooltipData] = useState<{
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    time: string;
    visible: boolean;
    left: number;
    top: number;
  }>({
    open: '',
    high: '',
    low: '',
    close: '',
    volume: '',
    time: '',
    visible: false,
    left: 0,
    top: 0
  });

  // Convert our data format to TradingView format
  const convertToChartData = useCallback((rawData: CandleData[]) => {
    // Sort data by timestamp in ascending order (required by lightweight-charts)
    const sortedData = [...rawData].sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove duplicate timestamps by keeping the last occurrence for each timestamp
    const uniqueData = sortedData.reduce((acc: CandleData[], current: CandleData) => {
      const existingIndex = acc.findIndex(item => item.timestamp === current.timestamp);
      if (existingIndex >= 0) {
        // Replace existing with current (keep the latest data for this timestamp)
        acc[existingIndex] = current;
      } else {
        acc.push(current);
      }
      return acc;
    }, []);
    
    const priceData = chartType === 'candlestick' 
      ? uniqueData.map(candle => ({
          time: candle.timestamp as UTCTimestamp,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }))
      : uniqueData.map(candle => ({
          time: candle.timestamp as UTCTimestamp,
          value: candle.close,
        }));

    const volumeData: HistogramData[] = uniqueData.map(candle => ({
      time: candle.timestamp as UTCTimestamp,
      value: candle.volume,
      color: candle.close >= candle.open ? '#22c55e80' : '#ef444480', // Semi-transparent colors
    }));

    return { priceData, volumeData, rawData: uniqueData };
  }, [chartType]);

  // Function to create series based on chart type
  const createSeries = useCallback(() => {
    if (!chartRef.current) return;

    // Remove existing series
    if (seriesRef.current && chartRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }
    if (volumeSeriesRef.current && chartRef.current) {
      chartRef.current.removeSeries(volumeSeriesRef.current);
      volumeSeriesRef.current = null;
    }

    if (chartType === 'candlestick') {
      seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      });
    } else {
      seriesRef.current = chartRef.current.addSeries(LineSeries, {
        color: '#2563eb',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
      });
    }

    // Add volume series
    volumeSeriesRef.current = chartRef.current.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
    });

    // Create separate price scale for volume
    if (chartRef.current) {
      chartRef.current.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
      });
    }
  }, [chartType]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart with TradingView-like styling
    const chart = createChart(chartContainerRef.current, {
      width,
      height,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      crosshair: {
        mode: 1, // Normal crosshair
      },
      rightPriceScale: {
        borderColor: '#cccccc',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#cccccc',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: 3,
        fixLeftEdge: false,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
        borderVisible: false,
        visible: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // Set up crosshair move handler for tooltips and legend
    chart.subscribeCrosshairMove((param: MouseEventParams) => {
      if (!param.time || !param.point || !seriesRef.current || !volumeSeriesRef.current) {
        setTooltipData(prev => ({ ...prev, visible: false }));
        setCrosshairPrice('');
        return;
      }

      const price = param.seriesData.get(seriesRef.current as any);
      const volume = param.seriesData.get(volumeSeriesRef.current as any);
      
      if (price) {
        // Handle both candlestick and line chart data
        if (typeof price === 'object' && 'close' in price) {
          // Candlestick data with OHLC
          const candleData = price;
          setCrosshairPrice(`$${candleData.close.toFixed(2)}`);
          
          const volumeValue = volume && typeof volume === 'object' && 'value' in volume ? volume.value : 0;
          
          setTooltipData({
            open: `$${candleData.open.toFixed(2)}`,
            high: `$${candleData.high.toFixed(2)}`,
            low: `$${candleData.low.toFixed(2)}`,
            close: `$${candleData.close.toFixed(2)}`,
            volume: volumeValue.toLocaleString(),
            time: new Date(param.time as number * 1000).toLocaleString(),
            visible: true,
            left: param.point.x + 10,
            top: param.point.y - 100,
          });
        } else if (typeof price === 'object' && 'value' in price) {
          // Line chart data - only has value (close price)
          const lineData = price;
          setCrosshairPrice(`$${lineData.value.toFixed(2)}`);
          
          const volumeValue = volume && typeof volume === 'object' && 'value' in volume ? volume.value : 0;
          
          setTooltipData({
            open: 'N/A',
            high: 'N/A',
            low: 'N/A',
            close: `$${lineData.value.toFixed(2)}`,
            volume: volumeValue.toLocaleString(),
            time: new Date(param.time as number * 1000).toLocaleString(),
            visible: true,
            left: param.point.x + 10,
            top: param.point.y - 100,
          });
        }
      }
    });

    // Initialize series after chart is created
    createSeries();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        const { clientWidth, clientHeight } = chartContainerRef.current;
        chartRef.current.applyOptions({
          width: clientWidth,
          height: clientHeight,
        });
      }
    };

    // Initial resize to fit container
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      seriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [width, height]);

  // Update series when chart type changes
  useEffect(() => {
    if (chartRef.current) {
      createSeries();
    }
  }, [chartType, createSeries]);

  // Update data when data or chart type changes
  useEffect(() => {
    if (chartRef.current && seriesRef.current && volumeSeriesRef.current && data.length > 0) {
      try {
        // Convert and set data using the helper function
        const { priceData, volumeData } = convertToChartData(data);
        
        seriesRef.current.setData(priceData as any);
        volumeSeriesRef.current.setData(volumeData);
        
        // Fit the chart content to show all data
        chartRef.current.timeScale().fitContent();
      } catch (error) {
        console.error('Error setting chart data:', error);
      }
    }
  }, [data, convertToChartData]);

  return (
    <div className={`relative ${className}`}>
      {/* Legend */}
      {legend && (
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm border rounded-md p-3 text-sm space-y-1">
          {legend.exchange && (
            <div><span className="font-medium">Exchange:</span> {legend.exchange}</div>
          )}
          {legend.pair && (
            <div><span className="font-medium">Pair:</span> {legend.pair}</div>
          )}
          {legend.dateRange && (
            <div><span className="font-medium">Date Range:</span> {legend.dateRange}</div>
          )}
          {crosshairPrice && (
            <div><span className="font-medium">Crosshair Price:</span> {crosshairPrice}</div>
          )}
        </div>
      )}

      {/* Chart Type Toggle */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant={chartType === 'candlestick' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('candlestick')}
        >
          <BarChart className="h-4 w-4" />
          Candlestick
        </Button>
        <Button
          variant={chartType === 'line' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('line')}
        >
          <TrendingUp className="h-4 w-4" />
          Line
        </Button>
      </div>

      {/* Tooltip */}
      {tooltipData.visible && (
        <div 
          className="absolute z-20 bg-gray-900 text-white text-xs rounded px-3 py-2 pointer-events-none border"
          style={{ 
            left: `${tooltipData.left}px`, 
            top: `${tooltipData.top}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div>Open: {tooltipData.open}</div>
            <div>High: {tooltipData.high}</div>
            <div>Low: {tooltipData.low}</div>
            <div>Close: {tooltipData.close}</div>
          </div>
          <div className="border-t border-gray-600 mt-1 pt-1">
            <div>Volume: {tooltipData.volume}</div>
            <div>Time: {tooltipData.time}</div>
          </div>
        </div>
      )}
      
      <div 
        ref={chartContainerRef}
        style={{ 
          width: '100%', 
          height: `${height}px`,
          position: 'relative'
        }}
      />
    </div>
  );
}