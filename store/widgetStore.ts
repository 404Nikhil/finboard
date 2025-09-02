import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { WidgetConfig } from '@/types/widget';

type WidgetState = {
  widgets: WidgetConfig[];
  addWidget: (config: Omit<WidgetConfig, 'id'>) => void;
  removeWidget: (id: string) => void;
};

const initialIbmWidget: WidgetConfig = {
  id: nanoid(),
  title: 'MSFT Company Overview',
  type: 'COMPANY_OVERVIEW',
  params: {
    symbol: 'MSFT',
  },
  refreshInterval: 3600,
};

export const useWidgetStore = create<WidgetState>((set) => ({
  widgets: [initialIbmWidget],
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
}));