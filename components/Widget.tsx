import React from 'react';

type WidgetProps = {
  id: string;
  title: string;
  onRemove: (id: string) => void;
  children: React.ReactNode;
};

export const Widget = ({ id, title, onRemove, children }: WidgetProps) => {
  return (
    <div className="bg-[#161B22] border border-gray-700 rounded-lg p-4 flex flex-col relative">
      <button
        onClick={() => onRemove(id)}
        className="absolute top-2 right-2 text-gray-500 hover:text-white font-bold"
        aria-label="Remove widget"
      >
        ✕
      </button>
      <h2 className="text-lg font-semibold mb-4 pr-6">{title}</h2>
      <div className="flex-grow">{children}</div>
      <p className="text-xs text-gray-500 mt-4">Last updated: Just now</p>
    </div>
  );
};