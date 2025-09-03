'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { WidgetConfig } from '@/types/widget';
import { getNestedValue } from '@/lib/utils';
import { transformApiData, API_ENDPOINTS } from '@/lib/apiConfig';

const fetcher = async (url: string) => {
  try {
    if (url.includes('coingecko')) {
      const response = await fetch(url);
      if (!response.ok) throw new Error('API request failed');
      return await response.json();
    }
    throw new Error('Using mock data');
  } catch (error) {
    return null;
  }
};

type TableWidgetProps = {
  config: Extract<WidgetConfig, { type: 'TABLE' }>;
};

export const TableWidget = ({ config }: TableWidgetProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const { data: rawData, error, isLoading } = useSWR(
    config.apiUrl?.includes('coingecko') ? API_ENDPOINTS.CRYPTO_LIST : 'mock-table-data',
    config.apiUrl?.includes('coingecko') ? fetcher : () => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(transformApiData.tableData(null, 'currency'));
        }, Math.random() * 1000 + 500);
      });
    },
    { refreshInterval: config.refreshInterval * 1000 }
  );

  if (error) return <div className="text-red-500">Failed to load table data.</div>;
  if (isLoading) return <div className="flex justify-center items-center h-full">Loading Table...</div>;
  
  if (!rawData) {
    return <div className="text-yellow-500">No table data found.</div>;
  }

  let tableData: any[] = [];
  
  if (Array.isArray(rawData)) {
    // CoinGecko format
    if (rawData[0]?.current_price) {
      tableData = rawData.map(coin => ({
        currency: coin.symbol?.toUpperCase() || coin.id,
        rate: coin.current_price?.toFixed(6) || '0.000000',
        name: coin.name || 'Unknown',
        change: coin.price_change_percentage_24h?.toFixed(2) + '%' || '0.00%',
        market_cap: coin.market_cap ? `$${(coin.market_cap / 1000000).toFixed(0)}M` : 'N/A',
      }));
    } else {
      tableData = rawData;
    }
  } else if (rawData.data && Array.isArray(rawData.data)) {
    tableData = rawData.data;
  } else {
    // Fallback to transformed mock data
    tableData = transformApiData.tableData(null, 'currency');
  }

  const filteredData = tableData.filter((item) => {
    if (!searchTerm) return true;
    return Object.values(item).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const headers = config.selectedFields.length > 0 
    ? config.selectedFields 
    : (paginatedData[0] ? Object.keys(paginatedData[0]) : []);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    
    if (typeof value === 'string' && value.includes('%')) {
      const num = parseFloat(value);
      return isNaN(num) ? value : `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
    }
    
    if (typeof value === 'number') {
      // Format currency-like numbers
      if (value > 1000000) {
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
      }
      if (value > 1) {
        return value.toFixed(2);
      }
      return value.toFixed(6);
    }
    return String(value);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search and Info Bar */}
      <div className="mb-4 space-y-2">
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-sm w-40"
          />
          <span className="text-xs text-gray-400">
            {filteredData.length} items
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-800">
            <tr>
              {headers.map((header) => (
                <th key={header} className="text-left p-2 border-b border-gray-700 text-xs font-medium text-gray-300">
                  {header.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-800 border-b border-gray-800">
                {headers.map((header) => {
                  const value = getNestedValue(item, header);
                  const isChange = header.toLowerCase().includes('change');
                  const isPositive = typeof value === 'string' && value.includes('+');
                  const isNegative = typeof value === 'string' && value.includes('-');
                  
                  return (
                    <td key={header} className={`p-2 ${
                      isChange ? (isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : '') : ''
                    }`}>
                      {formatValue(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-800">
          <div className="text-xs text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};