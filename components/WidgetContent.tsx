'use client';

import React from 'react';
import { WidgetConfig } from '@/types/widget';
import { OverviewWidget } from './OverviewWidget';
import { ChartWidget } from './ChartWidget';
import { TableWidget } from './TableWidget';
import { FinanceCardWidget } from './CardWidget';

type WidgetContentProps = {
  config: WidgetConfig;
};

export const WidgetContent = ({ config }: WidgetContentProps) => {
  switch (config.type) {
    case 'COMPANY_OVERVIEW':
      return <OverviewWidget config={config} />;
    case 'CHART':
      return <ChartWidget config={config} />;
    case 'TABLE':
      return <TableWidget config={config} />;
    case 'FINANCE_CARD':
      return <FinanceCardWidget config={config} />;
    default:
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm">Unknown widget type</div>
          </div>
        </div>
      );
  }
};