import React from 'react';

type WidgetProps = {
  id: string;
  title: string;
  onRemove: (id: string) => void;
  children: React.ReactNode;
};

export const Widget = ({ id, title, onRemove, children }: WidgetProps) => {
  return (
    <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col relative min-h-[200px]">      <div className="absolute top-2 right-2 flex space-x-2 z-10">
      {/* <button
        onPointerDown={(e) => e.stopPropagation()}
        className="text-gray-500 hover:text-white"
        aria-label="Edit widget"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button> */}
      <button
        onClick={() => onRemove(id)}
        onPointerDown={(e) => e.stopPropagation()}
        className="text-gray-500 hover:text-white font-bold"
        aria-label="Remove widget"
      >
        ✕
      </button>
    </div>
      <h2 className="text-lg font-semibold mb-4 pr-12">{title}</h2>
      <div className="flex-grow overflow-auto">{children}</div>
    </div>
  );
};