'use client';
import useSWR from 'swr';
import { WidgetConfig } from '@/types/widget';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const getApiUrl = (config: Omit<WidgetConfig, 'id' | 'title'>): string | null => {
  const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    console.error("API key is not set!");
    return null;
  }

  switch (config.type) {
    case 'COMPANY_OVERVIEW':
      return `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${config.params.symbol}&apikey=${apiKey}`;
    default:
      return null;
  }
};


export const WidgetContent = (config: Omit<WidgetConfig, 'id' | 'title'>) => {
  const apiUrl = getApiUrl(config);

  const { data, error, isLoading } = useSWR(
    apiUrl, 
    fetcher, 
    { refreshInterval: config.refreshInterval * 1000 }
  );
  
  if (!apiUrl) return <div className="text-red-500">Error: API key not configured.</div>;
  if (error) return <div className="text-red-500">Failed to load data.</div>;
  if (isLoading) return <div>Loading...</div>;

  if (Object.keys(data).length === 0) {
    return <div className="text-yellow-500">No data found. Please check the stock symbol or API usage limit.</div>
  }

  return (
    <pre className="text-xs text-left whitespace-pre-wrap break-all">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
};