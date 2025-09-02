'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WidgetConfig } from '@/types/widget';
import { Widget } from './Widget';
import { WidgetContent } from './WidgetContent';
import { useWidgetStore } from '@/store/widgetStore';

type SortableWidgetProps = {
  widget: WidgetConfig;
};

export const SortableWidget = ({ widget }: SortableWidgetProps) => {
  const { removeWidget } = useWidgetStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none', // Recommended for better mobile experience
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Widget
        id={widget.id}
        title={widget.title}
        onRemove={removeWidget}
      >
        <WidgetContent
          type={widget.type}
          params={widget.params}
          refreshInterval={widget.refreshInterval}
          selectedFields={widget.selectedFields}
        />
      </Widget>
    </div>
  );
};