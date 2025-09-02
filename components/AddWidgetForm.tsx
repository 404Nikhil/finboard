'use client';

import React, { useState } from 'react';
import { WidgetConfig } from '@/types/widget';

type AddWidgetFormProps = {
    onSubmit: (config: Omit<WidgetConfig, 'id'>) => void;
    onCancel: () => void;
};

export const AddWidgetForm = ({ onSubmit, onCancel }: AddWidgetFormProps) => {
    const [title, setTitle] = useState('');
    const [symbol, setSymbol] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && symbol.trim()) {
            onSubmit({ 
              title, 
              type: 'COMPANY_OVERVIEW', 
              params: { symbol: symbol.toUpperCase() }, 
              refreshInterval: 3600 
            });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="widgetName" className="block text-sm font-medium text-gray-300 mb-1">Widget Name</label>
                    <input
                        type="text"
                        id="widgetName"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2"
                        placeholder="e.g., Microsoft Overview"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="symbol" className="block text-sm font-medium text-gray-300 mb-1">Stock Symbol</label>
                    <input
                        type="text"
                        id="symbol"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        className="w-full bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2"
                        placeholder="e.g., AAPL, MSFT"
                        required
                    />
                </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 font-semibold">Add Widget</button>
            </div>
        </form>
    );
};