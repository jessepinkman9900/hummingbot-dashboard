'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  createChart, 
  IChartApi, 
  UTCTimestamp,
  ISeriesApi,
  CandlestickData,
  LineData,
  CandlestickSeries,
  LineSeries
} from 'lightweight-charts';
import { CandleData } from '@/lib/api/market-data';
import { Button } from '@/components/ui/button';
import { BarChart, TrendingUp } from 'lucide-react';

interface LightweightChartProps {
  data: CandleData[];
  width?: number;
  height?: number;
  className?: string;
}

type ChartType = 'candlestick' | 'line';

export function LightweightChart({ 
  data, 
  width = 800, 
  height = 400, 
  className 
}: LightweightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | null>(null);
  const [chartType, setChartType] = useState<ChartType>('candlestick');

  // Convert our data format to TradingView format
  const convertToChartData = useCallback((rawData: CandleData[]): CandlestickData[] | LineData[] => {
    if (chartType === 'candlestick') {
      return rawData.map(candle => ({
        time: candle.timestamp as UTCTimestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));
    } else {
      return rawData.map(candle => ({
        time: candle.timestamp as UTCTimestamp,
        value: candle.close,
      }));
    }
  }, [chartType]);

  // Function to create series based on chart type
  const createSeries = useCallback(() => {
    if (!chartRef.current) return;

    // Remove existing series
    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
    }

    if (chartType === 'candlestick') {
      seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });
    } else {
      seriesRef.current = chartRef.current.addSeries(LineSeries, {
        color: '#2563eb',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
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

    // Create initial series
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

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [width, height, createSeries]);

  // Update series when chart type changes
  useEffect(() => {
    createSeries();
  }, [createSeries]);

  // Update data when data or chart type changes
  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      const chartData = convertToChartData(data);
      seriesRef.current.setData(chartData);
      
      // Fit chart to data
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [data, convertToChartData]);

  return (
    <div className={`relative ${className}`}>
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