export type CompanyOverviewWidget = {
  id: string;
  title: string;
  type: 'COMPANY_OVERVIEW';
  params: {
    symbol: string;
  };
  apiUrl?: string;
  refreshInterval: number;
  selectedFields: string[];
};

export type ChartWidget = {
  id: string;
  title: string;
  type: 'CHART';
  params: {
    symbol: string;
  };
  apiUrl?: string;
  refreshInterval: number;
  selectedFields?: string[];
};

export type TableWidget = {
  id: string;
  title: string;
  type: 'TABLE';
  params: {
    symbols?: string[];
    category?: string;
  };
  apiUrl: string;
  refreshInterval: number;
  selectedFields: string[];
  displayMode: 'table';
};

export type FinanceCardWidget = {
  id: string;
  title: string;
  type: 'FINANCE_CARD';
  params: {
    category: 'watchlist' | 'gainers' | 'performance' | 'financial';
  };
  apiUrl: string;
  refreshInterval: number;
  selectedFields: string[];
  displayMode: 'card' | 'list';
};

export type WidgetConfig = CompanyOverviewWidget | ChartWidget | TableWidget | FinanceCardWidget;