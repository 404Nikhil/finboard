'use client';

import React, { useState, useMemo } from 'react';
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

  const tableData = useMemo(() => {
    if (!rawData) return [];

    let data: any[] = [];

    if (Array.isArray(rawData)) {
      if (rawData[0]?.current_price) {
        data = rawData.map(coin => ({
          currency: coin.symbol?.toUpperCase() || coin.id,
          rate: coin.current_price?.toFixed(6) || '0.000000',
          name: coin.name || 'Unknown',
          change: coin.price_change_percentage_24h?.toFixed(2) + '%' || '0.00%',
          market_cap: coin.market_cap ? `$${(coin.market_cap / 1000000).toFixed(0)}M` : 'N/A',
        }));
      } else {
        data = rawData;
      }
    } else if (rawData.data && Array.isArray(rawData.data)) {
      data = rawData.data;
    } else {
      data = transformApiData.tableData(null, 'currency');
    }

    return data;
  }, [rawData]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return tableData;

    const searchLower = searchTerm.toLowerCase();
    return tableData.filter((item) => {
      return Object.values(item).some(value => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchLower);
      });
    });
  }, [tableData, searchTerm]);

  const { paginatedData, totalPages } = useMemo(() => {
    const total = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filteredData.slice(startIndex, startIndex + itemsPerPage);

    return {
      paginatedData: paginated,
      totalPages: total
    };
  }, [filteredData, currentPage, itemsPerPage]);

  const headers = useMemo(() => {
    if (config.selectedFields.length > 0) {
      return config.selectedFields;
    }
    return paginatedData.length > 0 ? Object.keys(paginatedData[0]) : [];
  }, [config.selectedFields, paginatedData]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';

    if (typeof value === 'string' && value.includes('%')) {
      const num = parseFloat(value.replace('%', ''));
      return isNaN(num) ? value : `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
    }

    if (typeof value === 'number') {
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

  if (error) return <div className="text-red-500 p-4">Failed to load table data.</div>;
  if (isLoading) return <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mr-2"></div>
    Loading Table...
  </div>;

  if (!rawData || tableData.length === 0) {
    return <div className="text-yellow-500 p-4">No table data found.</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search and Info Bar */}
      <div className="mb-4 space-y-2">
        <div className="flex justify-between items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="px-3 py-1 pl-8 bg-gray-800 border border-gray-600 rounded text-sm w-48 focus:border-green-500 focus:outline-none"
            />
            <svg
              className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="text-xs text-gray-400">
            {filteredData.length} of {tableData.length} items
            {searchTerm && (
              <button
                onClick={() => handleSearchChange('')}
                className="ml-2 text-green-400 hover:text-green-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {searchTerm && filteredData.length === 0 && (
          <div className="text-sm text-yellow-400">
            No results found for "{searchTerm}"
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-800 z-10">
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
              <tr key={index} className="hover:bg-gray-800 border-b border-gray-800 transition-colors">
                {headers.map((header) => {
                  const value = getNestedValue(item, header);
                  const isChange = header.toLowerCase().includes('change');
                  const isPositive = typeof value === 'string' && (value.includes('+') || (parseFloat(value) > 0 && value.includes('%')));
                  const isNegative = typeof value === 'string' && (value.includes('-') || (parseFloat(value) < 0 && value.includes('%')));

                  return (
                    <td key={header} className={`p-2 ${isChange ? (isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : '') : ''
                      }`}>
                      {formatValue(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedData.length === 0 && !searchTerm && (
          <div className="text-center py-8 text-gray-400">
            No data available
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-800">
          <div className="text-xs text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded transition-colors"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded transition-colors"
            >
              ←
            </button>
            <span className="text-xs text-gray-400 px-2">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded transition-colors"
            >
              →
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded transition-colors"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};