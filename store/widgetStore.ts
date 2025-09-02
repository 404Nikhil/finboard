import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { persist } from 'zustand/middleware';
import { WidgetConfig, CompanyOverviewWidget, ChartWidget } from '@/types/widget';

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


export const useWidgetStore = create<WidgetState>()(
  persist(
    (set) => ({
      widgets: [initialMsftWidget, initialAaplChart],
      addWidget: (config) => {
        set((state) => ({
          widgets: [
            ...state.widgets,
            // type assertion here
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
              // type assertion here
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

