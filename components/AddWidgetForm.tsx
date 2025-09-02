'use client';

import React, { useState, useEffect } from 'react';
import { WidgetConfig, CompanyOverviewWidget, ChartWidget } from '@/types/widget';
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
  const [widgetType, setWidgetType] = useState<'COMPANY_OVERVIEW' | 'CHART'>('COMPANY_OVERVIEW');
  const [title, setTitle] = useState('');
  const [symbol, setSymbol] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testData, setTestData] = useState<any>(null);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [testError, setTestError] = useState('');

  useEffect(() => {
    if (isEditMode && initialData) {
      setWidgetType(initialData.type);
      setTitle(initialData.title);
      setSymbol(initialData.params.symbol);
      if (initialData.type === 'COMPANY_OVERVIEW') {
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
    if (!title.trim() || !symbol.trim()) return;

    if (widgetType === 'COMPANY_OVERVIEW') {
      if (selectedFields.length > 0) {
        const newWidget: Omit<CompanyOverviewWidget, 'id'> = {
          title,
          type: 'COMPANY_OVERVIEW',
          params: { symbol: symbol.toUpperCase() },
          refreshInterval: 3600,
          selectedFields,
        };
        onSubmit(newWidget);
      }
    } else if (widgetType === 'CHART') {
      const newWidget: Omit<ChartWidget, 'id'> = {
        title,
        type: 'CHART',
        params: { symbol: symbol.toUpperCase() },
        refreshInterval: 86400,
      };
      onSubmit(newWidget);
    }
  };

  const isSubmitDisabled = 
    !title.trim() || 
    !symbol.trim() || 
    (widgetType === 'COMPANY_OVERVIEW' && selectedFields.length === 0);

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Widget Type</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input type="radio" name="widgetType" value="COMPANY_OVERVIEW" checked={widgetType === 'COMPANY_OVERVIEW'} onChange={() => setWidgetType('COMPANY_OVERVIEW')} className="text-green-500 focus:ring-green-500" disabled={isEditMode} />
              <span className="ml-2">Company Overview</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="widgetType" value="CHART" checked={widgetType === 'CHART'} onChange={() => setWidgetType('CHART')} className="text-green-500 focus:ring-green-500" disabled={isEditMode} />
              <span className="ml-2">Stock Chart</span>
            </label>
          </div>
        </div>
        <div>
          <label htmlFor="widgetName" className="block text-sm font-medium text-gray-300 mb-1">Widget Title</label>
          <input type="text" id="widgetName" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2" placeholder="e.g., Apple Inc. Overview" />
        </div>
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-300 mb-1">Stock Symbol</label>
          <div className="flex space-x-2">
            <input type="text" id="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} required className="flex-grow bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2" placeholder="e.g., AAPL" />
            {widgetType === 'COMPANY_OVERVIEW' && (
              <button type="button" onClick={() => handleTestApi()} disabled={isTesting} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 font-semibold disabled:bg-gray-500">
                {isTesting ? 'Testing...' : 'Test'}
              </button>
            )}
          </div>
        </div>
      </div>

      {testError && <p className="text-red-500 mt-4">{testError}</p>}
      {widgetType === 'COMPANY_OVERVIEW' && testData && (
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
        <button type="submit" disabled={isSubmitDisabled} className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 font-semibold disabled:opacity-50">
          {isEditMode ? 'Update Widget' : 'Add Widget'}
        </button>
      </div>
    </form>
  );
};
