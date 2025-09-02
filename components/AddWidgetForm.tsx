'use client';

import React, { useState } from 'react';

type AddWidgetFormProps = {
    onSubmit: (title: string) => void;
    onCancel: () => void;
};

export const AddWidgetForm = ({ onSubmit, onCancel }: AddWidgetFormProps) => {
    const [title, setTitle] = useState('');
    // to do: api url and other fields

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onSubmit(title.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="widgetName" className="block text-sm font-medium text-gray-300 mb-1">
                        Widget Name
                    </label>
                    <input
                        type="text"
                        id="widgetName"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        placeholder="e.g., coin price tracker"
                        required
                    />
                </div>
                {/* to do: api fields*/}
            </div>
            <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700">
                    Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 font-semibold">
                    Add Widget
                </button>
            </div>
        </form>
    );
};