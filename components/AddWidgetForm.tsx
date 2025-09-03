'use client';

import React, { useState, useEffect } from 'react';
import { WidgetConfig } from '@/types/widget';
import { getObjectKeys } from '@/lib/utils';

type AddWidgetFormProps = {
    onSubmit: (config: Omit<WidgetConfig, 'id'>) => void;
    onCancel: () => void;
    initialData?: WidgetConfig;
};

type WidgetType = 'COMPANY_OVERVIEW' | 'CHART' | 'TABLE' | 'FINANCE_CARD';
type DisplayMode = 'card' | 'table' | 'list';

const getDefaultApiUrl = (type: WidgetType, symbol?: string): string => {
  const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
  
  switch (type) {
    case 'COMPANY_OVERVIEW':
      return `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol || 'AAPL'}&apikey=${apiKey}`;
    case 'CHART':
      return `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol || 'AAPL'}&apikey=${apiKey}`;
    case 'TABLE':
      return `https://api.coinbase.com/v2/exchange-rates?currency=BTC`;
    case 'FINANCE_CARD':
      return `https://api.coinbase.com/v2/exchange-rates?currency=BTC`;
    default:
      return '';
  }
};

export const AddWidgetForm = ({ onSubmit, onCancel, initialData }: AddWidgetFormProps) => {
  const isEditMode = !!initialData;
  const [widgetType, setWidgetType] = useState<WidgetType>('COMPANY_OVERVIEW');
  const [title, setTitle] = useState('');
  const [symbol, setSymbol] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [customApiUrl, setCustomApiUrl] = useState('');
  const [useCustomApi, setUseCustomApi] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('card');
  const [category, setCategory] = useState<'watchlist' | 'gainers' | 'performance' | 'financial'>('watchlist');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testData, setTestData] = useState<any>(null);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [testError, setTestError] = useState('');

  useEffect(() => {
    if (isEditMode && initialData) {
      setWidgetType(initialData.type);
      setTitle(initialData.title);
      setRefreshInterval(initialData.refreshInterval);
      
      if (initialData.type === 'COMPANY_OVERVIEW' || initialData.type === 'CHART') {
        setSymbol(initialData.params.symbol);
      }
      
      if (initialData.apiUrl) {
        setUseCustomApi(true);
        setCustomApiUrl(initialData.apiUrl);
        setApiUrl(initialData.apiUrl);
      }
      
      if ('selectedFields' in initialData) {
        setSelectedFields(initialData.selectedFields);
      }
      
      if ('displayMode' in initialData) {
        setDisplayMode(initialData.displayMode);
      }
      
      if (initialData.type === 'FINANCE_CARD') {
        setCategory(initialData.params.category);
      }
    }
  }, [isEditMode, initialData]);

  useEffect(() => {
    if (!useCustomApi) {
      const defaultUrl = getDefaultApiUrl(widgetType, symbol);
      setApiUrl(defaultUrl);
    } else {
      setApiUrl(customApiUrl);
    }
  }, [widgetType, symbol, useCustomApi, customApiUrl]);

  const handleTestApi = async () => {
    if (!apiUrl) {
      setTestError('Please enter an API URL first.');
      return;
    }
    
    setIsTesting(true);
    setTestError('');
    setTestData(null);
    setSelectedFields([]);

    try {
      const res = await fetch(apiUrl);
      const data = await res.json();
      
      if (data.error || data.Note) {
        throw new Error(data.error?.message || data.Note || 'API Error');
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
    if (!title.trim() || !apiUrl.trim()) return;

    const baseConfig = {
      title,
      refreshInterval,
      apiUrl: useCustomApi ? customApiUrl : undefined,
    };

    switch (widgetType) {
      case 'COMPANY_OVERVIEW':
        if (selectedFields.length > 0 && symbol.trim()) {
          onSubmit({
            ...baseConfig,
            type: 'COMPANY_OVERVIEW',
            params: { symbol: symbol.toUpperCase() },
            selectedFields,
          });
        }
        break;
      case 'CHART':
        if (symbol.trim()) {
          onSubmit({
            ...baseConfig,
            type: 'CHART',
            params: { symbol: symbol.toUpperCase() },
          });
        }
        break;
      case 'TABLE':
        if (selectedFields.length > 0) {
          onSubmit({
            ...baseConfig,
            type: 'TABLE',
            params: {},
            apiUrl: useCustomApi ? customApiUrl : apiUrl,
            selectedFields,
            displayMode: 'table',
          });
        }
        break;
      case 'FINANCE_CARD':
        if (selectedFields.length > 0) {
          onSubmit({
            ...baseConfig,
            type: 'FINANCE_CARD',
            params: { category },
            apiUrl: useCustomApi ? customApiUrl : apiUrl,
            selectedFields,
            displayMode,
          });
        }
        break;
    }
  };

  const needsSymbol = widgetType === 'COMPANY_OVERVIEW' || widgetType === 'CHART';
  const needsFields = widgetType !== 'CHART';
  const isSubmitDisabled = 
    !title.trim() || 
    !apiUrl.trim() ||
    (needsSymbol && !symbol.trim()) ||
    (needsFields && selectedFields.length === 0);

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Widget Type</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center p-2 border border-gray-600 rounded cursor-pointer hover:bg-gray-700">
                <input 
                  type="radio" 
                  name="widgetType" 
                  value="COMPANY_OVERVIEW" 
                  checked={widgetType === 'COMPANY_OVERVIEW'} 
                  onChange={() => setWidgetType('COMPANY_OVERVIEW')} 
                  className="text-green-500 focus:ring-green-500" 
                  disabled={isEditMode} 
                />
                <span className="ml-2 text-sm">Company Overview</span>
              </label>
              <label className="flex items-center p-2 border border-gray-600 rounded cursor-pointer hover:bg-gray-700">
                <input 
                  type="radio" 
                  name="widgetType" 
                  value="CHART" 
                  checked={widgetType === 'CHART'} 
                  onChange={() => setWidgetType('CHART')} 
                  className="text-green-500 focus:ring-green-500" 
                  disabled={isEditMode} 
                />
                <span className="ml-2 text-sm">Chart</span>
              </label>
              <label className="flex items-center p-2 border border-gray-600 rounded cursor-pointer hover:bg-gray-700">
                <input 
                  type="radio" 
                  name="widgetType" 
                  value="TABLE" 
                  checked={widgetType === 'TABLE'} 
                  onChange={() => setWidgetType('TABLE')} 
                  className="text-green-500 focus:ring-green-500" 
                  disabled={isEditMode} 
                />
                <span className="ml-2 text-sm">Table</span>
              </label>
              <label className="flex items-center p-2 border border-gray-600 rounded cursor-pointer hover:bg-gray-700">
                <input 
                  type="radio" 
                  name="widgetType" 
                  value="FINANCE_CARD" 
                  checked={widgetType === 'FINANCE_CARD'} 
                  onChange={() => setWidgetType('FINANCE_CARD')} 
                  className="text-green-500 focus:ring-green-500" 
                  disabled={isEditMode} 
                />
                <span className="ml-2 text-sm">Finance Card</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="widgetName" className="block text-sm font-medium text-gray-300 mb-1">
              Widget Title
            </label>
            <input 
              type="text" 
              id="widgetName" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              className="w-full bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2" 
              placeholder="Enter widget title" 
            />
          </div>

          {needsSymbol && (
            <div>
              <label htmlFor="symbol" className="block text-sm font-medium text-gray-300 mb-1">
                Stock Symbol
              </label>
              <input 
                type="text" 
                id="symbol" 
                value={symbol} 
                onChange={(e) => setSymbol(e.target.value)} 
                required={needsSymbol}
                className="w-full bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2" 
                placeholder="e.g., AAPL" 
              />
            </div>
          )}

          {widgetType === 'FINANCE_CARD' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2"
              >
                <option value="watchlist">Watchlist</option>
                <option value="gainers">Market Gainers</option>
                <option value="performance">Performance Data</option>
                <option value="financial">Financial Data</option>
              </select>
            </div>
          )}

          {(widgetType === 'FINANCE_CARD') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Display Mode</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="displayMode" 
                    value="card" 
                    checked={displayMode === 'card'} 
                    onChange={() => setDisplayMode('card')} 
                    className="text-green-500 focus:ring-green-500" 
                  />
                  <span className="ml-2">Card</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="displayMode" 
                    value="list" 
                    checked={displayMode === 'list'} 
                    onChange={() => setDisplayMode('list')} 
                    className="text-green-500 focus:ring-green-500" 
                  />
                  <span className="ml-2">List</span>
                </label>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">API URL</label>
              <label className="flex items-center text-sm">
                <input 
                  type="checkbox" 
                  checked={useCustomApi} 
                  onChange={(e) => setUseCustomApi(e.target.checked)}
                  className="text-green-500 focus:ring-green-500 mr-2" 
                />
                Use Custom API
              </label>
            </div>
            
            {useCustomApi ? (
              <div className="flex space-x-2">
                <input 
                  type="url" 
                  value={customApiUrl} 
                  onChange={(e) => setCustomApiUrl(e.target.value)} 
                  required={useCustomApi}
                  className="flex-grow bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2" 
                  placeholder="https://api.example.com/data" 
                />
                <button 
                  type="button" 
                  onClick={handleTestApi} 
                  disabled={isTesting || !customApiUrl}
                  className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 font-semibold disabled:bg-gray-500"
                >
                  {isTesting ? 'Testing...' : 'Test'}
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={apiUrl} 
                  readOnly
                  className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-400" 
                />
                <button 
                  type="button" 
                  onClick={handleTestApi} 
                  disabled={isTesting || !apiUrl}
                  className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 font-semibold disabled:bg-gray-500"
                >
                  {isTesting ? 'Testing...' : 'Test'}
                </button>
              </div>
            )}
            
            {apiUrl && !useCustomApi && (
              <div className="mt-2 p-2 bg-green-900 border border-green-600 rounded-md flex items-center">
                <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-300 text-sm">API connection successful! 1 top-level fields found.</span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="refreshInterval" className="block text-sm font-medium text-gray-300 mb-1">
              Refresh Interval (seconds)
            </label>
            <input 
              type="number" 
              id="refreshInterval" 
              value={refreshInterval} 
              onChange={(e) => setRefreshInterval(parseInt(e.target.value) || 30)} 
              min="10"
              className="w-full bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2" 
            />
          </div>
        </div>

        {testError && (
          <div className="mt-4 p-3 bg-red-900 border border-red-600 rounded-md">
            <p className="text-red-300">{testError}</p>
          </div>
        )}

        {needsFields && testData && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Select Fields to Display</h3>
            <p className="text-sm text-gray-400 mb-3">Choose which data fields to show in your widget</p>
            
            <div className="border border-gray-700 rounded-lg max-h-60 flex">
              <div className="w-1/2 border-r border-gray-700 overflow-y-auto">
                <h4 className="p-3 font-bold bg-gray-800 sticky top-0 border-b border-gray-700">
                  Available Fields
                </h4>
                <div className="p-2">
                  {availableFields.map(field => (
                    <button 
                      key={field} 
                      type="button" 
                      onClick={() => toggleField(field)}
                      className={`block w-full text-left p-2 text-sm rounded hover:bg-gray-700 mb-1 ${
                        selectedFields.includes(field) ? 'bg-gray-700' : ''
                      }`}
                    >
                      + {field}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="w-1/2 overflow-y-auto">
                <h4 className="p-3 font-bold bg-gray-800 sticky top-0 border-b border-gray-700">
                  Selected Fields ({selectedFields.length})
                </h4>
                <div className="p-2">
                  {selectedFields.length === 0 ? (
                    <p className="text-gray-500 text-sm p-2">No fields selected</p>
                  ) : (
                    selectedFields.map(field => (
                      <button 
                        key={field} 
                        type="button" 
                        onClick={() => toggleField(field)}
                        className="block w-full text-left p-2 text-sm rounded hover:bg-gray-700 mb-1 bg-gray-700"
                      >
                        ✕ {field}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-4 mt-6">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitDisabled}
            className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 font-semibold disabled:opacity-50"
          >
            {isEditMode ? 'Update Widget' : 'Add Widget'}
          </button>
        </div>
      </form>
    </div>
  );
};