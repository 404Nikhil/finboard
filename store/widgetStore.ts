
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

const initialAppleOverview: CompanyOverviewWidget = {
  id: nanoid(),
  title: 'Apple Inc. (AAPL) Overview',
  type: 'COMPANY_OVERVIEW',
  params: {
    symbol: 'AAPL',
  },
  refreshInterval: 300,
  selectedFields: ['Symbol', 'Name', 'MarketCapitalization', 'PERatio', 'EBITDA', 'Beta'],
};

const initialMicrosoftChart: ChartWidget = {
  id: nanoid(),
  title: 'Microsoft Corporation Stock Chart',
  type: 'CHART',
  params: {
    symbol: 'MSFT',
  },
  refreshInterval: 900,
};

const initialCryptoTable: TableWidget = {
  id: nanoid(),
  title: 'Cryptocurrency Market Data',
  type: 'TABLE',
  params: {},
  apiUrl: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1',
  refreshInterval: 120,
  selectedFields: ['currency', 'rate', 'name', 'change', 'market_cap'],
  displayMode: 'table',
};

const initialWatchlistCard: FinanceCardWidget = {
  id: nanoid(),
  title: 'Stock Watchlist',
  type: 'FINANCE_CARD',
  params: {
    category: 'watchlist',
  },
  apiUrl: 'mock://finance-card',
  refreshInterval: 180,
  selectedFields: ['symbol', 'price', 'change', 'name'],
  displayMode: 'card',
};

const initialGainersCard: FinanceCardWidget = {
  id: nanoid(),
  title: 'Top Market Gainers',
  type: 'FINANCE_CARD',
  params: {
    category: 'gainers',
  },
  apiUrl: 'mock://finance-card',
  refreshInterval: 300,
  selectedFields: ['symbol', 'price', 'change', 'volume'],
  displayMode: 'list',
};

const initialPerformanceCard: FinanceCardWidget = {
  id: nanoid(),
  title: 'Portfolio Performance',
  type: 'FINANCE_CARD',
  params: {
    category: 'performance',
  },
  apiUrl: 'mock://finance-card',
  refreshInterval: 600,
  selectedFields: ['metric', 'value', 'change'],
  displayMode: 'card',
};

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set) => ({
      widgets: [
        initialAppleOverview,
        initialMicrosoftChart,
        initialCryptoTable,
        initialWatchlistCard,
        initialGainersCard,
        initialPerformanceCard,
      ],
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