'use client';

import React from 'react';
import useSWR from 'swr';
import { WidgetConfig } from '@/types/widget';
import { getNestedValue } from '@/lib/utils';
import { transformApiData } from '@/lib/apiConfig';

type FinanceCardWidgetProps = {
  config: Extract<WidgetConfig, { type: 'FINANCE_CARD' }>;
};

export const FinanceCardWidget = ({ config }: FinanceCardWidgetProps) => {
  const { data: rawData, error, isLoading } = useSWR(
    `mock-finance-${config.params.category}`,
    () => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(transformApiData.financeCardData(null, config.params.category));
        }, Math.random() * 1000 + 500);
      });
    },
    { refreshInterval: config.refreshInterval * 1000 }
  );

  if (error) return <div className="text-red-500">Failed to load finance data.</div>;
  if (isLoading) return <div className="flex justify-center items-center h-full">Loading...</div>;

  if (!rawData || !Array.isArray(rawData)) {
    return <div className="text-yellow-500">No finance data found.</div>;
  }

  const displayData = rawData.slice(0, 5); // Show top 5 items

  const formatValue = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A';

    if (typeof value === 'string' && value.includes('%')) {
      return value;
    }

    if (typeof value === 'string' && value.includes('$')) {
      return value;
    }

    if (typeof value === 'number') {
      if (value > 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      } else if (value > 1000) {
        return `$${(value / 1000).toFixed(1)}K`;
      } else if (value > 1) {
        return value.toFixed(2);
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

  const getChangeColor = (value: string) => {
    if (value.includes('+')) return 'text-green-400';
    if (value.includes('-')) return 'text-red-400';
    return 'text-gray-400';
  };

  if (config.displayMode === 'card') {
    return (
      <div className="space-y-3">
        {displayData.map((item, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{getCategoryIcon()}</span>
              <span className={`text-xs font-semibold ${getCategoryColor()}`}>
                {config.params.category.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2">
              {config.selectedFields.slice(0, 3).map((field) => {
                const value = getNestedValue(item, field);
                const isChangeField = field.toLowerCase().includes('change');

                return (
                  <div key={field} className="flex justify-between text-sm">
                    <span className="text-gray-400 truncate capitalize">
                      {field.replace(/_/g, ' ')}:
                    </span>
                    <span className={`font-semibold text-right ml-2 ${isChangeField ? getChangeColor(String(value)) : ''
                      }`}>
                      {formatValue(value as string | number | null | undefined)}
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
        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-b-0 hover:bg-gray-800 hover:bg-opacity-50 rounded px-2 transition-colors">
          <div className="flex-1">
            {config.selectedFields.slice(0, 2).map((field, fieldIndex) => {
              const value = getNestedValue(item, field);
              const isMainField = fieldIndex === 0;
              const isChangeField = field.toLowerCase().includes('change');

              return (
                <div
                  key={field}
                  className={`${isMainField
                    ? 'font-semibold text-sm text-white'
                    : `text-xs ${isChangeField ? getChangeColor(String(value)) : 'text-gray-400'}`
                    }`}
                >
                  {isMainField ? formatValue(value as string | number | null | undefined) : `${field.replace(/_/g, ' ')}: ${formatValue(value as string | number | null | undefined)}`}
                </div>
              );
            })}
          </div>

          {config.selectedFields.length > 2 && (
            <div className="text-right">
              <div className="text-sm font-semibold text-white">
                {formatValue(getNestedValue(item, config.selectedFields[2]) as string | number | null | undefined)}
              </div>
              <div className="text-xs text-gray-400 capitalize">
                {config.selectedFields[2].replace(/_/g, ' ')}
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="pt-2 text-xs text-gray-500 text-center border-t border-gray-800">
        Showing {displayData.length} items • Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};