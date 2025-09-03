
'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { WidgetConfig } from '@/types/widget';
import { getNestedValue } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type TableWidgetProps = {
  config: Extract<WidgetConfig, { type: 'TABLE' }>;
};

export const TableWidget = ({ config }: TableWidgetProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const { data, error, isLoading } = useSWR(
    config.apiUrl, 
    fetcher, 
    { refreshInterval: config.refreshInterval * 1000 }
  );

  if (error) return <div className="text-red-500">Failed to load table data.</div>;
  if (isLoading) return <div className="flex justify-center items-center h-full">Loading Table...</div>;
  
  if (!data) {
    return <div className="text-yellow-500">No table data found.</div>;
  }

  let tableData: any[] = [];
  
  if (Array.isArray(data)) {
    tableData = data;
  } else if (data.data && Array.isArray(data.data)) {
    tableData = data.data;
  } else if (data.rates && typeof data.rates === 'object') {
    // Handle Coinbase API format
    tableData = Object.entries(data.rates).map(([currency, rate]) => ({
      currency,
      rate,
    }));
  } else {
    const arrays = Object.values(data).filter(Array.isArray);
    if (arrays.length > 0) {
      tableData = arrays[0] as any[];
    }
  }

  const filteredData = tableData.filter((item) => {
    if (!searchTerm) return true;
    return Object.values(item).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const headers = config.selectedFields.length > 0 
    ? config.selectedFields 
    : (paginatedData[0] ? Object.keys(paginatedData[0]) : []);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      // Format currency-like numbers
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
                <th key={header} className="text-left p-2 border-b border-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-800 border-b border-gray-800">
                {headers.map((header) => (
                  <td key={header} className="p-2">
                    {formatValue(getNestedValue(item, header))}
                  </td>
                ))}
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