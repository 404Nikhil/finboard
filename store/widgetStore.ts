import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { persist } from 'zustand/middleware';
import { WidgetConfig, CompanyOverviewWidget, ChartWidget, TableWidget, FinanceCardWidget } from '@/types/widget';

type WidgetState = {
  widgets: WidgetConfig[];
  addWidget: (config: Omit<WidgetConfig, 'id'>) => void;
  removeWidget: (id: string) => void;
  setWidgets: (widgets: WidgetConfig[]) => void;
  updateWidget: (id: string, newConfig: Partial<WidgetConfig>) => void;
};

const initialMsftWidget: CompanyOverviewWidget = {
  id: nanoid(),
  title: 'MSFT Company Overview',
  type: 'COMPANY_OVERVIEW',
  params: {
    symbol: 'MSFT',
  },
  refreshInterval: 3600,
  selectedFields: ['Symbol', 'Name', 'MarketCapitalization', 'EBITDA'],
};

const initialAaplChart: ChartWidget = {
  id: nanoid(),
  title: 'Apple Inc. (AAPL) Stock Chart',
  type: 'CHART',
  params: {
    symbol: 'AAPL',
  },
  refreshInterval: 86400,
};

const initialCryptoTable: TableWidget = {
  id: nanoid(),
  title: 'Cryptocurrency Rates',
  type: 'TABLE',
  params: {},
  apiUrl: 'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
  refreshInterval: 60,
  selectedFields: ['currency', 'rate'],
  displayMode: 'table',
};

const initialGainersCard: FinanceCardWidget = {
  id: nanoid(),
  title: 'Market Gainers',
  type: 'FINANCE_CARD',
  params: {
    category: 'gainers',
  },
  apiUrl: 'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
  refreshInterval: 300,
  selectedFields: ['currency', 'rate'],
  displayMode: 'card',
};

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set) => ({
      widgets: [initialMsftWidget, initialAaplChart, initialCryptoTable, initialGainersCard],
      addWidget: (config) => {
        set((state) => ({
          widgets: [
            ...state.widgets,
            { id: nanoid(), ...config } as WidgetConfig,
          ],
        }));
      },
      removeWidget: (id) => {
        set((state) => ({
          widgets: state.widgets.filter((widget) => widget.id !== id),
        }));
      },
      setWidgets: (widgets) => set({ widgets }),
      updateWidget: (id, newConfig) => {
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id
              ? ({ ...widget, ...newConfig } as WidgetConfig)
              : widget
          ),
        }));
      },
    }),
    {
      name: 'finboard-storage',
    }
  )
);