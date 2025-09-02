import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { persist } from 'zustand/middleware';
import { WidgetConfig } from '@/types/widget';

type WidgetState = {
  widgets: WidgetConfig[];
  addWidget: (config: Omit<WidgetConfig, 'id'>) => void;
  removeWidget: (id: string) => void;
  setWidgets: (widgets: WidgetConfig[]) => void;
  updateWidget: (id: string, newConfig: Partial<WidgetConfig>) => void; 
};



// wrapping the store creation with persist to enable localStorage persistence
export const useWidgetStore = create<WidgetState>()(
  persist(
    (set) => ({
      // initial state is now defined here. it will only be used if there's no data in localStorage.
      widgets: [
        {
          id: nanoid(),
          title: 'MSFT Company Overview',
          type: 'COMPANY_OVERVIEW',
          params: {
            symbol: 'MSFT',
          },
          refreshInterval: 3600,
          selectedFields: ['Symbol', 'Name', 'MarketCapitalization', 'EBITDA'], 
        },
      ],
      addWidget: (config) => {
        set((state) => ({
          widgets: [...state.widgets, { id: nanoid(), ...config }],
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
            widget.id === id ? { ...widget, ...newConfig } : widget
          ),
        }));
      },
    }),
    {
      name: 'finboard-storage',
    }
  )
);