import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { WidgetConfig } from '@/types/widget';

type WidgetState = {
  widgets: WidgetConfig[];
  addWidget: (title: string) => void;
  removeWidget: (id: string) => void;
};

export const useWidgetStore = create<WidgetState>((set) => ({
  widgets: [
    { id: nanoid(), title: 'Crypto Price' },
  ],
  addWidget: (title) => {
    set((state) => ({
      widgets: [...state.widgets, { id: nanoid(), title }],
    }));
  },
  removeWidget: (id) => {
    set((state) => ({
      widgets: state.widgets.filter((widget) => widget.id !== id),
    }));
  },
}));