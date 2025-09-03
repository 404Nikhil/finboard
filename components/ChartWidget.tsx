'use client';

import React from 'react';
import useSWR from 'swr';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { WidgetConfig } from '@/types/widget';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const transformData = (data: any) => {
  // Alpha Vantage Time Series format
  if (data['Time Series (Daily)']) {
    const timeSeries = data['Time Series (Daily)'];
    return Object.entries(timeSeries)
      .slice(0, 30)
      .map(([date, values]: [string, any]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: parseFloat(values['4. close']),
        fullDate: date,
      }))
      .reverse();
  }
  
  if (data.prices && Array.isArray(data.prices)) {
    return data.prices.slice(-30).map((item: any, index: number) => ({
      date: item.date || `Day ${index + 1}`,
      price: parseFloat(item.price || item.value || item.close),
    }));
  }
  
  if (Array.isArray(data)) {
    return data.slice(-30).map((item: any, index: number) => ({
      date: item.date || item.time || `Point ${index + 1}`,
      price: parseFloat(item.price || item.value || item.y || 0),
    }));
  }
  
  return [];
};

type ChartWidgetProps = {
  config: Extract<WidgetConfig, { type: 'CHART' }>;
};

export const ChartWidget = ({ config }: ChartWidgetProps) => {
  const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
  const defaultApiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${config.params.symbol}&apikey=${apiKey}`;
  const apiUrl = config.apiUrl || defaultApiUrl;

  const { data, error, isLoading } = useSWR(
    apiUrl, 
    fetcher, 
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
  
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-yellow-400">
        <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div className="text-sm">No chart data available</div>
      </div>
    );
  }

  if (data.Note || data.Information || data.error || data['Error Message']) {
    const errorMessage = data.Note || data.Information || data.error || data['Error Message'];
    return (
      <div className="flex flex-col items-center justify-center h-full text-yellow-400">
        <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div className="text-xs text-center px-2">{errorMessage}</div>
      </div>
    );
  }

  const chartData = transformData(data);

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01.293.707v6.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L6 13.586V7.414L3.707 5.121A1 1 0 013 4z" clipRule="evenodd" />
        </svg>
        <div className="text-sm">No chart data to display</div>
      </div>
    );
  }

  const firstPrice = chartData[0]?.price || 0;
  const lastPrice = chartData[chartData.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice !== 0 ? ((priceChange / firstPrice) * 100) : 0;

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

      <div className="flex-1" style={{ minHeight: '150px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                borderColor: '#374151',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#F9FAFB' }}
              formatter={(value: any, name: string) => [
                `$${parseFloat(value).toFixed(2)}`,
                'Price'
              ]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#10B981" 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 4, fill: '#10B981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex justify-between text-xs text-gray-400">
        <span>Current: ${lastPrice.toFixed(2)}</span>
        <span>{chartData.length} data points</span>
      </div>
    </div>
  );
};