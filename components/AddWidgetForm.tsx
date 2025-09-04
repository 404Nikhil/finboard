'use client';

import React, { useState, useEffect } from 'react';
import { WidgetConfig } from '@/types/widget';
import { getObjectKeys } from '@/lib/utils';
import { API_ENDPOINTS, MOCK_DATA } from '@/lib/apiConfig';

type AddWidgetFormProps = {
  onSubmit: (config: Omit<WidgetConfig, 'id'>) => void;
  onCancel: () => void;
  initialData?: WidgetConfig;
};

type WidgetType = 'COMPANY_OVERVIEW' | 'CHART' | 'TABLE' | 'FINANCE_CARD';
type DisplayMode = 'card' | 'table' | 'list';

const getDefaultApiUrl = (type: WidgetType): string => {
  switch (type) {
    case 'COMPANY_OVERVIEW':
      return 'mock://company-overview';
    case 'CHART':
      return 'mock://chart-data';
    case 'TABLE':
      return API_ENDPOINTS.CRYPTO_LIST;
    case 'FINANCE_CARD':
      return 'mock://finance-card';
    default:
      return '';
  }
};

const getSampleFields = (type: WidgetType): string[] => {
  switch (type) {
    case 'COMPANY_OVERVIEW':
      return ['Symbol', 'Name', 'MarketCapitalization', 'PERatio', 'EBITDA', 'Beta'];
    case 'TABLE':
      return ['currency', 'rate', 'name', 'change', 'market_cap'];
    case 'FINANCE_CARD':
      return ['symbol', 'price', 'change', 'name', 'volume'];
    default:
      return [];
  }
};

export const AddWidgetForm = ({ onSubmit, onCancel, initialData }: AddWidgetFormProps) => {
  const isEditMode = !!initialData;
  const [widgetType, setWidgetType] = useState<WidgetType>('COMPANY_OVERVIEW');
  const [title, setTitle] = useState('');
  const [symbol, setSymbol] = useState('AAPL');
  const [apiUrl, setApiUrl] = useState('');
  const [customApiUrl, setCustomApiUrl] = useState('');
  const [useCustomApi, setUseCustomApi] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('card');
  const [category, setCategory] = useState<'watchlist' | 'gainers' | 'performance' | 'financial'>('watchlist');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
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
        setSelectedFields(initialData.selectedFields ?? []);
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
      const defaultUrl = getDefaultApiUrl(widgetType);
      setApiUrl(defaultUrl);
    } else {
      setApiUrl(customApiUrl);
    }

    if (!isEditMode) {
      const defaultFields = getSampleFields(widgetType);
      setSelectedFields(defaultFields.slice(0, 4)); // Select first 4 by default
    }
  }, [widgetType, useCustomApi, customApiUrl, isEditMode]);

  const handleTestApi = async () => {
    setIsTesting(true);
    setTestError('');

    try {
      if (apiUrl.startsWith('mock://')) {
        let mockData;
        switch (widgetType) {
          case 'COMPANY_OVERVIEW':
            mockData = MOCK_DATA.COMPANY_OVERVIEW['AAPL'];
            break;
          case 'CHART':
            mockData = MOCK_DATA.CHART_DATA['AAPL'];
            break;
          case 'TABLE':
            mockData = MOCK_DATA.CRYPTO_TABLE;
            break;
          case 'FINANCE_CARD':
            mockData = MOCK_DATA.FINANCE_CARDS[category];
            break;
        }

        if (Array.isArray(mockData)) {
          setAvailableFields(mockData.length > 0 ? Object.keys(mockData[0]) : []);
        } else {
          setAvailableFields(getObjectKeys(mockData));
        }
      } else {
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (data.error) {
          throw new Error(data.error?.message || 'API Error');
        }

        if (Array.isArray(data)) {
          setAvailableFields(data.length > 0 ? Object.keys(data[0]) : []);
        } else {
          setAvailableFields(getObjectKeys(data));
        }
      }
    } catch (error) {
      setTestError((error as Error).message || 'Failed to fetch data. Using mock data for demo.');
      const defaultFields = getSampleFields(widgetType);
      setAvailableFields(defaultFields);
      setSelectedFields(defaultFields.slice(0, 4));
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
    if (!title.trim()) return;

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
            ...(widgetType === 'TABLE' && { displayMode }),
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
            ...(widgetType === 'FINANCE_CARD' && { displayMode }),
          });
        }
        break;
    }
  };

  const needsSymbol = widgetType === 'COMPANY_OVERVIEW' || widgetType === 'CHART';
  const needsFields = widgetType !== 'CHART';

  useEffect(() => {
    if (needsFields && selectedFields.length === 0 && availableFields.length === 0) {
      const defaultFields = getSampleFields(widgetType);
      setAvailableFields(defaultFields);
      setSelectedFields(defaultFields.slice(0, 4));
    }
  }, [widgetType, needsFields, selectedFields.length, availableFields.length]);

  const isSubmitDisabled =
    !title.trim() ||
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
              {/* <label className="flex items-center p-2 border border-gray-600 rounded cursor-pointer hover:bg-gray-700">
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
              </label> */}
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
              className="w-full bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2 text-white"
              placeholder={`Enter widget title (e.g., ${symbol} ${widgetType.replace('_', ' ').toLowerCase()})`}
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
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                required={needsSymbol}
                className="w-full bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2 text-white"
                placeholder="e.g., AAPL, MSFT, GOOGL"
              />
              <p className="text-xs text-gray-500 mt-1">Popular symbols: AAPL, MSFT, GOOGL, TSLA, AMZN</p>
            </div>
          )}

          {widgetType === 'FINANCE_CARD' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'watchlist' | 'gainers' | 'performance' | 'financial')}
                className="w-full bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2 text-white"
              >
                <option value="watchlist">Watchlist - Track your favorite stocks</option>
                <option value="gainers">Market Gainers - Top performing stocks</option>
                <option value="performance">Performance Data - Portfolio metrics</option>
                <option value="financial">Financial Data - Market indicators</option>
              </select>
            </div>
          )}
          {/*
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
                  <span className="ml-2">Card View</span>
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
                  <span className="ml-2">List View</span>
                </label>
              </div>
            </div>
          )} */}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">Data Source</label>
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
                  className="flex-grow bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2 text-white"
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
                  value={apiUrl.startsWith('mock://') ? 'Using demo data' : apiUrl}
                  readOnly
                  className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-400"
                />
                <button
                  type="button"
                  onClick={handleTestApi}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 font-semibold disabled:bg-gray-500"
                >
                  {isTesting ? 'Loading...' : 'Preview'}
                </button>
              </div>
            )}

            {!testError && (availableFields.length > 0 || selectedFields.length > 0) && (
              <div className="mt-2 p-2 bg-green-900 border border-green-600 rounded-md flex items-center">
                <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-300 text-sm">
                  Ready! {availableFields.length || selectedFields.length} fields available for configuration.
                </span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="refreshInterval" className="block text-sm font-medium text-gray-300 mb-1">
              Refresh Interval (seconds)
            </label>
            <select
              id="refreshInterval"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              className="w-full bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2 text-white"
            >
              <option value={30}>30 seconds - High frequency</option>
              <option value={60}>1 minute - Standard</option>
              <option value={300}>5 minutes - Moderate</option>
              <option value={900}>15 minutes - Low frequency</option>
              <option value={3600}>1 hour - Very low</option>
            </select>
          </div>
        </div>

        {testError && (
          <div className="mt-4 p-3 bg-yellow-900 border border-yellow-600 rounded-md">
            <p className="text-yellow-300 text-sm">{testError}</p>
            <p className="text-yellow-200 text-xs mt-1">Don&apos;t worry! Demo data will be used to show how the widget works.</p>
          </div>
        )}

        {needsFields && (availableFields.length > 0 || selectedFields.length > 0) && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2 text-white">Select Fields to Display</h3>
            <p className="text-sm text-gray-400 mb-3">Choose which data fields to show in your widget (selected: {selectedFields.length})</p>

            <div className="border border-gray-700 rounded-lg max-h-60 flex">
              <div className="w-1/2 border-r border-gray-700 overflow-y-auto">
                <h4 className="p-3 font-bold bg-gray-800 sticky top-0 border-b border-gray-700 text-white">
                  Available Fields ({availableFields.length})
                </h4>
                <div className="p-2">
                  {availableFields.length === 0 && selectedFields.length > 0 && (
                    <p className="text-gray-500 text-sm p-2">Using preset fields for {widgetType}</p>
                  )}
                  {availableFields.map(field => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => toggleField(field)}
                      className={`block w-full text-left p-2 text-sm rounded hover:bg-gray-700 mb-1 transition-colors ${selectedFields.includes(field) ? 'bg-gray-700 text-green-400' : 'text-gray-300'
                        }`}
                    >
                      {selectedFields.includes(field) ? '✓' : '+'} {field.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-1/2 overflow-y-auto">
                <h4 className="p-3 font-bold bg-gray-800 sticky top-0 border-b border-gray-700 text-white">
                  Selected Fields ({selectedFields.length})
                </h4>
                <div className="p-2">
                  {selectedFields.length === 0 ? (
                    <p className="text-gray-500 text-sm p-2">No fields selected yet. Click fields from the left to add them.</p>
                  ) : (
                    selectedFields.map((field, index) => (
                      <button
                        key={field}
                        type="button"
                        onClick={() => toggleField(field)}
                        className="block w-full text-left p-2 text-sm rounded hover:bg-gray-700 mb-1 bg-gray-700 text-white transition-colors"
                      >
                        <span className="text-red-400">✕</span> {field.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1')}
                        {index < 3 && <span className="text-xs text-green-400 ml-2">• Primary</span>}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {selectedFields.length > 0 && (
              <div className="mt-2 text-xs text-gray-400">
                💡 Tip: The first few selected fields will be prominently displayed in your widget.
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="px-6 py-2 rounded-md bg-green-600 hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isEditMode ? 'Update Widget' : 'Create Widget'}
          </button>
        </div>
      </form>
    </div>
  );
};