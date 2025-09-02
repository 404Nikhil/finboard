export type CompanyOverviewWidget = {
  id: string;
  title: string;
  type: 'COMPANY_OVERVIEW';
  params: {
    symbol: string;
  };
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
  refreshInterval: number;
};

export type WidgetConfig = CompanyOverviewWidget | ChartWidget;