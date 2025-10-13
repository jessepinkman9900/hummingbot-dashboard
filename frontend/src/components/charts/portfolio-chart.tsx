'use client';

import React, { useEffect, useRef } from 'react';
import { 
  createChart, 
  IChartApi, 
  UTCTimestamp,
  LineData 
} from 'lightweight-charts';

interface PortfolioChartData {
  time: number;
  value: number;
}

interface PortfolioChartProps {
  data: PortfolioChartData[];
  width?: number;
  height?: number;
  className?: string;
  theme?: 'light' | 'dark';
}

export function PortfolioChart({ 
  data, 
  width = 800, 
  height = 300, 
  className,
  theme = 'light'
}: PortfolioChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart with theme-aware colors
    const chart = createChart(chartContainerRef.current, {
      width,
      height,
      layout: {
        background: { color: theme === 'light' ? '#ffffff' : '#0a0a0a' },
        textColor: theme === 'light' ? '#333' : '#d4d4d8',
      },
      grid: {
        vertLines: { color: theme === 'light' ? '#f0f0f0' : '#262626' },
        horzLines: { color: theme === 'light' ? '#f0f0f0' : '#262626' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: theme === 'light' ? '#cccccc' : '#404040',
        textColor: theme === 'light' ? '#333' : '#d4d4d8',
      },
      timeScale: {
        borderColor: theme === 'light' ? '#cccccc' : '#404040',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        vertTouchDrag: false,
      },
    });

    chartRef.current = chart;

    // Add line series with dynamic color based on performance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lineSeries = (chart as any).addLineSeries({
      color: '#2563eb',
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
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

    // Create ResizeObserver for better resize handling
    const resizeObserver = new ResizeObserver(handleResize);
    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [width, height, theme]);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      // Convert data to lightweight-charts format
      const chartData: LineData[] = data.map(item => ({
        time: item.time as UTCTimestamp,
        value: item.value,
      }));

      // Sort data by time to ensure proper display
      chartData.sort((a, b) => (a.time as number) - (b.time as number));

      seriesRef.current.setData(chartData);

      // Auto-fit content
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }

      // Update line color based on performance (first vs last value)
      if (chartData.length > 1) {
        const firstValue = chartData[0].value;
        const lastValue = chartData[chartData.length - 1].value;
        const isPositive = lastValue >= firstValue;
        
        seriesRef.current.applyOptions({
          color: isPositive ? '#10b981' : '#ef4444', // green for positive, red for negative
        });
      }
    }
  }, [data]);

  return (
    <div 
      ref={chartContainerRef}
      className={className}
      style={{ 
        width: '100%', 
        height: `${height}px`,
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
}