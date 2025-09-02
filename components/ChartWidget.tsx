'use client';

import React from 'react';
import useSWR from 'swr';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { WidgetConfig } from '@/types/widget';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const transformData = (data: any) => {
  const timeSeries = data['Time Series (Daily)'];
  if (!timeSeries) return [];
  
  //last 30 days of closing prices
  return Object.entries(timeSeries).slice(0, 30).map(([date, values]: [string, any]) => ({
    date,
    price: parseFloat(values['4. close']),
  })).reverse(); // reverse to have the dates in chronological order
};

type ChartWidgetProps = {
  config: Extract<WidgetConfig, { type: 'CHART' }>;
};

export const ChartWidget = ({ config }: ChartWidgetProps) => {
  const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
  const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${config.params.symbol}&apikey=${apiKey}`;

  const { data, error, isLoading } = useSWR(
    apiUrl, 
    fetcher, 
    { refreshInterval: config.refreshInterval * 1000 }
  );

  if (error) return <div className="text-red-500">Failed to load chart data.</div>;
  if (isLoading) return <div className="flex justify-center items-center h-full">Loading Chart...</div>;
  if (!data || data.Note || !data['Time Series (Daily)']) {
    return <div className="text-yellow-500">No chart data found. Check symbol or API limit.</div>
  }

  const chartData = transformData(data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9CA3AF" />
        <YAxis tick={{ fontSize: 10 }} stroke="#9CA3AF" domain={['dataMin', 'dataMax']} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            borderColor: '#374151',
          }}
          labelStyle={{ color: '#F9FAFB' }}
        />
        <Line type="monotone" dataKey="price" stroke="#10B981" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};