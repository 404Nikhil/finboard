'use client';

import React from 'react';
import useSWR from 'swr';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { WidgetConfig } from '@/types/widget';
import { transformApiData } from '@/lib/apiConfig';

type ChartWidgetProps = {
  config: Extract<WidgetConfig, { type: 'CHART' }>;
};

export const ChartWidget = ({ config }: ChartWidgetProps) => {
  const { data: chartData, error, isLoading } = useSWR(
    `mock-chart-${config.params.symbol}`,
    () => {
      return new Promise(resolve => {
        setTimeout(() => {
          const data = transformApiData.chartData(null, config.params.symbol);
          console.log('Chart data for', config.params.symbol, ':', data); // Debug log
          resolve(data);
        }, Math.random() * 1000 + 500);
      });
    },
    {
      refreshInterval: config.refreshInterval * 1000,
      revalidateOnFocus: false,
    }
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div className="text-sm">Failed to load chart data</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2"></div>
        <div className="text-sm text-gray-400">Loading Chart...</div>
      </div>
    );
  }

  if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
    console.warn('Invalid chart data:', chartData); // Debug log
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01.293.707v6.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L6 13.586V7.414L3.707 5.121A1 1 0 013 4z" clipRule="evenodd" />
        </svg>
        <div className="text-sm">No chart data to display</div>
        <div className="text-xs text-gray-500 mt-1">Symbol: {config.params.symbol}</div>
      </div>
    );
  }

  const validData = chartData.filter(d => d && typeof d.price === 'number' && !isNaN(d.price));
  
  if (validData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01.293.707v6.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L6 13.586V7.414L3.707 5.121A1 1 0 013 4z" clipRule="evenodd" />
        </svg>
        <div className="text-sm">Invalid price data</div>
      </div>
    );
  }

  const firstPrice = validData[0]?.price || 0;
  const lastPrice = validData[validData.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice !== 0 ? ((priceChange / firstPrice) * 100) : 0;

  const prices = validData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1 || 1; // Prevent zero padding

  return (
    <div className="h-full flex flex-col">
      {/* Chart Header */}
      <div className="mb-2 flex justify-between items-center">
        <div className="text-sm text-gray-400">
          {config.params.symbol} • Last 30 days
        </div>
        <div className={`text-sm font-semibold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
        </div>
      </div>

      <div className="mb-3 text-center">
        <div className="text-xl font-bold text-white">
          ${lastPrice.toFixed(2)}
        </div>
        <div className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {priceChange >= 0 ? '+' : ''}${Math.abs(priceChange).toFixed(2)} ({priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
        </div>
      </div>

      <div className="flex-1" style={{ minHeight: '150px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={validData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              domain={[minPrice - padding, maxPrice + padding]}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                borderColor: '#374151',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#F9FAFB' }}
              formatter={(value: any) => [
                `$${parseFloat(value).toFixed(2)}`,
                'Price'
              ]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={priceChange >= 0 ? "#10B981" : "#EF4444"}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: priceChange >= 0 ? "#10B981" : "#EF4444" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex justify-between text-xs text-gray-400">
        <span>Range: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}</span>
        <span>{validData.length} data points</span>
      </div>
    </div>
  );
};