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

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export const TableWidget = ({ config }: TableWidgetProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
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
    { 
      refreshInterval: config.refreshInterval * 1000,
      revalidateOnFocus: false,
      dedupingInterval: 60, 
    }
  );

  const tableData = useMemo(() => {
    if (!rawData) return [];

    let data: any[] = [];

    try {
      if (Array.isArray(rawData)) {
        if (rawData.length > 0 && rawData[0]?.current_price !== undefined) {
          // CoinGecko API data
          data = rawData.map(coin => ({
            currency: coin.symbol?.toUpperCase() || coin.id || 'N/A',
            rate: coin.current_price ? parseFloat(coin.current_price).toFixed(6) : '0.000000',
            name: coin.name || 'Unknown',
            change: coin.price_change_percentage_24h 
              ? `${coin.price_change_percentage_24h >= 0 ? '+' : ''}${parseFloat(coin.price_change_percentage_24h).toFixed(2)}%` 
              : '0.00%',
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
    } catch (error) {
      console.warn('Error processing table data, using fallback:', error);
      data = transformApiData.tableData(null, 'currency');
    }

    return data;
  }, [rawData]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return tableData;

    return [...tableData].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const aNum = parseFloat(String(aValue).replace(/[^\d.-]/g, ''));
      const bNum = parseFloat(String(bValue).replace(/[^\d.-]/g, ''));
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tableData, sortConfig]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return sortedData;

    const searchLower = searchTerm.toLowerCase().trim();
    return sortedData.filter((item) => {
      return Object.values(item).some(value => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchLower);
      });
    });
  }, [sortedData, searchTerm]);

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
    if (config.selectedFields && config.selectedFields.length > 0) {
      return config.selectedFields;
    }
    return paginatedData.length > 0 ? Object.keys(paginatedData[0]) : [];
  }, [config.selectedFields, paginatedData]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        } else {
          return null;
        }
      } else {
        return { key, direction: 'asc' };
      }
    });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) {
      return (
        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortConfig.direction === 'asc' ? (
      <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';

    if (typeof value === 'string' && value.includes('%')) {
      const num = parseFloat(value.replace('%', ''));
      if (!isNaN(num)) {
        return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
      }
      return value;
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

    if (typeof value === 'string') {
      const num = parseFloat(value);
      if (!isNaN(num) && value === num.toString()) {
        if (num > 1) return num.toFixed(2);
        return num.toFixed(6);
      }
    }

    return String(value);
  };

  if (error) return (
    <div className="text-red-500 p-4 text-center">
      <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      Failed to load table data. Using demo data.
    </div>
  );

  if (isLoading) return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mr-2"></div>
      Loading Table...
    </div>
  );

  if (!rawData || tableData.length === 0) {
    return (
      <div className="text-yellow-500 p-4 text-center">
        <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
        </svg>
        No table data found.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 space-y-2">
        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="px-3 py-1 pl-8 pr-8 bg-gray-800 border border-gray-600 rounded text-sm w-full focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <svg
              className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="text-xs text-gray-400 ml-4">
            {filteredData.length} of {tableData.length} items
            {sortConfig && (
              <span className="ml-2 text-green-400">
                • Sorted by {sortConfig.key} ({sortConfig.direction})
              </span>
            )}
          </div>
        </div>

        {searchTerm && filteredData.length === 0 && (
          <div className="text-sm text-yellow-400 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            No results found for "{searchTerm}"
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-800 z-10">
            <tr>
              {headers.map((header) => (
                <th 
                  key={header} 
                  className="text-left p-2 border-b border-gray-700 text-xs font-medium text-gray-300 cursor-pointer hover:bg-gray-700 select-none"
                  onClick={() => handleSort(header)}
                >
                  <div className="flex items-center justify-between">
                    <span>{header.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').toUpperCase()}</span>
                    {getSortIcon(header)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={`${currentPage}-${index}`} className="hover:bg-gray-800 border-b border-gray-800 transition-colors">
                {headers.map((header) => {
                  const value = getNestedValue(item, header);
                  const isChange = header.toLowerCase().includes('change');
                  const isPositive = typeof value === 'string' && (value.includes('+') || (parseFloat(value) > 0 && value.includes('%')));
                  const isNegative = typeof value === 'string' && (value.includes('-') || (parseFloat(value) < 0 && value.includes('%')));

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

        {paginatedData.length === 0 && !searchTerm && (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
            No data available
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-800">
          <div className="text-xs text-gray-400">
            Page {currentPage} of {totalPages} • Showing {paginatedData.length} of {filteredData.length} items
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              title="First page"
            >
              ⇤
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              title="Previous page"
            >
              ←
            </button>
            <span className="text-xs text-gray-400 px-2 min-w-[60px] text-center">
              {currentPage}/{totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              title="Next page"
            >
              →
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              title="Last page"
            >
              ⇥
            </button>
          </div>
        </div>
      )}
    </div>
  );
};