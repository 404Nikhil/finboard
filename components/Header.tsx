import React from 'react';
type HeaderProps = {
  onAddWidgetClick: () => void;
};

export const Header = ({ onAddWidgetClick }: HeaderProps) => {
  return (
    <header className="p-4 border-b border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 hover:disabled rounded-md flex items-center justify-center font-bold">
            F
          </div>
          <h1 className="text-xl font-semibold">FinBoard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onAddWidgetClick}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            + Add Widget
          </button>
        </div>
      </div>
    </header>
  );
};