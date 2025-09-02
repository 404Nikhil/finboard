'use client';

import React, { useState, useEffect } from 'react';
import { WidgetConfig } from '@/types/widget';
import { getObjectKeys } from '@/lib/utils';

type AddWidgetFormProps = {
    onSubmit: (config: Omit<WidgetConfig, 'id'>) => void;
    onCancel: () => void;
    initialData?: WidgetConfig;
  };

const getApiUrl = (symbol: string): string | null => {
  const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
  if (!apiKey) return null;
  return `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;
};

export const AddWidgetForm = ({ onSubmit, onCancel, initialData }: AddWidgetFormProps) => {
  const isEditMode = !!initialData;
  const [title, setTitle] = useState('');
  const [symbol, setSymbol] = useState('');  
  const [isTesting, setIsTesting] = useState(false);
  const [testData, setTestData] = useState<any>(null);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [testError, setTestError] = useState('');

  useEffect(() => {
    if (isEditMode && initialData) {
      setTitle(initialData.title);
      if (initialData.type === 'COMPANY_OVERVIEW') {
        setSymbol(initialData.params.symbol);
        setSelectedFields(initialData.selectedFields);
        handleTestApi(true, initialData.params.symbol);
      }
    }
  }, [isEditMode, initialData]);

 const handleTestApi = async (isInitialTest = false, testSymbol?: string) => {
    const currentSymbol = testSymbol || symbol;    
    if (!currentSymbol) {
      setTestError('Please enter a stock symbol first.');
      return;
    }
    setIsTesting(true);
    setTestError('');
    setTestData(null);

    if (!isInitialTest) {
      setSelectedFields([]);
    }

    const url = getApiUrl(currentSymbol.toUpperCase());
    if (!url) {
      setTestError('API Key is not configured.');
      setIsTesting(false);
      return;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.Note || Object.keys(data).length === 0) {
        throw new Error('API limit reached or symbol not found.');
      }
      setTestData(data);
      setAvailableFields(getObjectKeys(data));
    } catch (error: any) {
      setTestError(error.message || 'Failed to fetch data.');
    } finally {
      setIsTesting(false);
    }
  };

  const toggleField = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field) 
        : [...prev, field]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && symbol.trim() && selectedFields.length > 0) {
      onSubmit({ 
        title, 
        type: 'COMPANY_OVERVIEW', 
        params: { symbol: symbol.toUpperCase() }, 
        refreshInterval: 3600,
        selectedFields,
      });
    }
  };


  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="widgetName" className="block text-sm font-medium text-gray-300 mb-1">Widget Name</label>
          <input type="text" id="widgetName" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2" placeholder="e.g., Apple Inc. Overview" />
        </div>
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-300 mb-1">Stock Symbol</label>
          <div className="flex space-x-2">
            <input type="text" id="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} required className="flex-grow bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2" placeholder="e.g., AAPL" />
            <button type="button" onClick={() => handleTestApi()} disabled={isTesting} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 font-semibold disabled:bg-gray-500">
              {isTesting ? 'Testing...' : 'Test'}
            </button>
          </div>
        </div>
      </div>

      {testError && <p className="text-red-500 mt-4">{testError}</p>}
      {testData && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Select Fields to Display</h3>
          <p className="text-sm text-gray-400 mb-2">Click on a field to add or remove it from the widget.</p>
          <div className="flex border border-gray-700 rounded-lg max-h-60">
            <div className="w-1/2 border-r border-gray-700 overflow-y-auto">
              <h4 className="p-2 font-bold bg-gray-800 sticky top-0">Available Fields</h4>
              {availableFields.map(field => (
                <button key={field} type="button" onClick={() => toggleField(field)} className="block w-full text-left p-2 text-sm hover:bg-gray-700">
                  {field}
                </button>
              ))}
            </div>
            <div className="w-1/2 overflow-y-auto">
              <h4 className="p-2 font-bold bg-gray-800 sticky top-0">Selected Fields ({selectedFields.length})</h4>
              {selectedFields.map(field => (
                <button key={field} type="button" onClick={() => toggleField(field)} className="block w-full text-left p-2 text-sm hover:bg-gray-700">
                  {field}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-4 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700">Cancel</button>
        <button type="submit" disabled={selectedFields.length === 0} className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 font-semibold disabled:opacity-50">
          {isEditMode ? 'Update Widget' : 'Add Widget'}
        </button>
      </div>
    </form>
  );
};