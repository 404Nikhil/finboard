'use client';

import React from 'react';
import useSWR from 'swr';
import { WidgetConfig } from '@/types/widget';
import { getNestedValue } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type FinanceCardWidgetProps = {
  config: Extract<WidgetConfig, { type: 'FINANCE_CARD' }>;
};

export const FinanceCardWidget = ({ config }: FinanceCardWidgetProps) => {
  const { data, error, isLoading } = useSWR(
    config.apiUrl, 
    fetcher, 
    { refreshInterval: config.refreshInterval * 1000 }
  );

  if (error) return <div className="text-red-500">Failed to load finance data.</div>;
  if (isLoading) return <div className="flex justify-center items-center h-full">Loading...</div>;
  
  if (!data) {
    return <div className="text-yellow-500">No finance data found.</div>;
  }

  let displayData: any[] = [];
  
  if (Array.isArray(data)) {
    displayData = data.slice(0, 5); // top 5 items
  } else if (data.data && Array.isArray(data.data)) {
    displayData = data.data.slice(0, 5);
  } else if (data.rates && typeof data.rates === 'object') {
    // Coinbase API format - show top currencies
    displayData = Object.entries(data.rates)
      .slice(0, 5)
      .map(([currency, rate]) => ({ currency, rate }));
  } else {
    displayData = [data];
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      if (value > 1000) {
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
      }
      return value.toFixed(6);
    }
    return String(value);
  };

  const getCategoryIcon = () => {
    switch (config.params.category) {
      case 'watchlist':
        return '👁️';
      case 'gainers':
        return '📈';
      case 'performance':
        return '⚡';
      case 'financial':
        return '💰';
      default:
        return '📊';
    }
  };

  const getCategoryColor = () => {
    switch (config.params.category) {
      case 'watchlist':
        return 'text-blue-400';
      case 'gainers':
        return 'text-green-400';
      case 'performance':
        return 'text-yellow-400';
      case 'financial':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  if (config.displayMode === 'card') {
    return (
      <div className="space-y-3">
        {displayData.map((item, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-lg ${getCategoryIcon()}`}>{getCategoryIcon()}</span>
              <span className={`text-xs ${getCategoryColor()}`}>
                {config.params.category.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-1">
              {config.selectedFields.slice(0, 3).map(field => {
                const value = getNestedValue(item, field);
                return (
                  <div key={field} className="flex justify-between text-sm">
                    <span className="text-gray-400 truncate">{field}:</span>
                    <span className="font-semibold text-right ml-2">
                      {formatValue(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center mb-3">
        <span className="text-lg mr-2">{getCategoryIcon()}</span>
        <span className={`text-sm font-semibold ${getCategoryColor()}`}>
          {config.params.category.charAt(0).toUpperCase() + config.params.category.slice(1)}
        </span>
      </div>
      
      {displayData.map((item, index) => (
        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-b-0">
          <div className="flex-1">
            {config.selectedFields.slice(0, 2).map((field, fieldIndex) => {
              const value = getNestedValue(item, field);
              return (
                <div key={field} className={fieldIndex === 0 ? 'font-semibold text-sm' : 'text-xs text-gray-400'}>
                  {fieldIndex === 0 ? formatValue(value) : `${field}: ${formatValue(value)}`}
                </div>
              );
            })}
          </div>
          
          {config.selectedFields.length > 2 && (
            <div className="text-right">
              <div className="text-sm font-semibold">
                {formatValue(getNestedValue(item, config.selectedFields[2]))}
              </div>
              <div className="text-xs text-gray-400">
                {config.selectedFields[2]}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};