'use client';

import React, { useEffect, useRef } from 'react';
import { 
  createChart, 
  IChartApi, 
  UTCTimestamp 
} from 'lightweight-charts';
import { CandleData } from '@/lib/api/market-data';

interface LightweightChartProps {
  data: CandleData[];
  width?: number;
  height?: number;
  className?: string;
}

export function LightweightChart({ 
  data, 
  width = 800, 
  height = 400, 
  className 
}: LightweightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
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
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#cccccc',
      },
      timeScale: {
        borderColor: '#cccccc',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Create line series to show closing prices
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lineSeries = (chart as any).addLineSeries({
      color: '#2563eb',
      lineWidth: 2,
    });

    seriesRef.current = lineSeries;

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
  }, [width, height]);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      // Convert data to line chart format (using closing prices)
      const chartData = data.map(candle => ({
        time: candle.time as UTCTimestamp,
        value: candle.close,
      }));

      seriesRef.current.setData(chartData);
    }
  }, [data]);

  return (
    <div 
      ref={chartContainerRef}
      className={className}
      style={{ 
        width: '100%', 
        height: `${height}px`,
        position: 'relative'
      }}
    />
  );
}