'use client';
import useSWR from 'swr';
import { WidgetConfig } from '@/types/widget';
import { getNestedValue } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const getApiUrl = (config: Omit<WidgetConfig, 'id' | 'title' | 'selectedFields'>): string | null => {
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

type WidgetContentProps = {
  config: WidgetConfig; 
};

export const WidgetContent = ({ config }: WidgetContentProps) => {
  if (config.type !== 'COMPANY_OVERVIEW') {
    return <div>Chart or other widget type</div>;
  }
  
  const { selectedFields } = config;
  const apiUrl = getApiUrl(config);

  const { data, error, isLoading } = useSWR(
    apiUrl, 
    fetcher, 
    { refreshInterval: config.refreshInterval * 1000 }
  );
  
  if (!apiUrl) return <div className="text-red-500">Error: API key not configured.</div>;
  if (error) return <div className="text-red-500">Failed to load data.</div>;
  if (isLoading) return <div className="flex justify-center items-center h-full">Loading...</div>;
  if (Object.keys(data).length === 0 || data.Note) {
    return <div className="text-yellow-500">No data found. Check symbol or API limit.</div>
  }

  return (
    <div className="space-y-2 text-sm">
      {selectedFields.map(field => {
        const value = getNestedValue(data, field);
        return (
          <div key={field} className="flex justify-between border-b border-gray-800 py-1">
            <span className="text-gray-400">{field}</span>
            <span className="font-semibold text-right">
              {value !== undefined ? String(value) : 'N/A'}
            </span>
          </div>
        );
      })}
    </div>
  );
};