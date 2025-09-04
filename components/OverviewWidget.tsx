'use client';
import useSWR from 'swr';
import { WidgetConfig } from '@/types/widget';
import { getNestedValue } from '@/lib/utils';
import { transformApiData } from '@/lib/apiConfig';

type OverviewWidgetProps = {
  config: Extract<WidgetConfig, { type: 'COMPANY_OVERVIEW' }>;
};

export const OverviewWidget = ({ config }: OverviewWidgetProps) => {
  const { selectedFields, params } = config;

  const { data, error, isLoading } = useSWR<{ Symbol?: string; Name?: string }>(
    `mock-company-${params.symbol}`,
    () => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(transformApiData.companyOverview(null, params.symbol));
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
        <div className="text-sm text-center">Failed to load data</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2"></div>
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-yellow-400">
        <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div className="text-xs text-center px-2">No data available</div>
      </div>
    );
  }

  const formatValue = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined || value === 'None' || value === '-') {
      return 'N/A';
    }

    if (typeof value === 'string' && value.trim() === '') {
      return 'N/A';
    }

    if (typeof value === 'string' && /^\d+$/.test(value)) {
      const num = parseInt(value);
      if (num > 1000000000) {
        return `$${(num / 1000000000).toFixed(1)}B`;
      } else if (num > 1000000) {
        return `$${(num / 1000000).toFixed(1)}M`;
      } else if (num > 1000) {
        return `$${(num / 1000).toFixed(1)}K`;
      }
    }

    if (typeof value === 'string' && (value.includes('.') && !value.includes('%'))) {
      const num = parseFloat(value);
      if (!isNaN(num) && num < 100 && num > 0.001) {
        return num.toFixed(2);
      }
    }

    return String(value);
  };

  return (
    <div className="space-y-3 text-sm">
      {selectedFields.map(field => {
        const value = getNestedValue(data, field);
        return (
          <div key={field} className="flex justify-between items-center border-b border-gray-800 pb-2">
            <span className="text-gray-400 text-xs font-medium">{field.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span className="font-semibold text-right ml-3 text-sm">
              {formatValue(value as string | number | null | undefined)}
            </span>
          </div>
        );
      })}

      {data.Symbol && (
        <div className="pt-2 border-t border-gray-700">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{data.Symbol}</div>
            <div className="text-xs text-gray-400">{data.Name}</div>
          </div>
        </div>
      )}

      <div className="pt-2 text-xs text-gray-500 text-center">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};