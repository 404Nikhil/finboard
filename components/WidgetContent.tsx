// components/WidgetContent.tsx
'use client';

import React from 'react';
import { WidgetConfig } from '@/types/widget';
import { OverviewWidget } from './OverviewWidget'; 
import { ChartWidget } from './ChartWidget';

type WidgetContentProps = {
  config: WidgetConfig;
};

export const WidgetContent = ({ config }: WidgetContentProps) => {
  switch (config.type) {
    case 'COMPANY_OVERVIEW':
      return <OverviewWidget config={config} />;
    case 'CHART':
      return <ChartWidget config={config} />;
    default:
      return <div>Unknown widget type</div>;
  }
};