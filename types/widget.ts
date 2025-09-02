export type WidgetConfig = {
  id: string;
  title: string;
  type: 'COMPANY_OVERVIEW'; 
  params: {
    symbol: string;
  };
  refreshInterval: number;
};