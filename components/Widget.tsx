import React from 'react';

type WidgetProps = {
  title: string;
  children: React.ReactNode;
};

export const Widget = ({ title, children }: WidgetProps) => {
  return (
    <div className="bg-[#161B22] border border-gray-700 rounded-lg p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="flex-grow">{children}</div>
      <p className="text-xs text-gray-500 mt-4">Last updated: Just now</p>
    </div>
  );
};