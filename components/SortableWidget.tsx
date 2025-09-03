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
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
};

export const SortableWidget = ({ widget, onEdit, onRemove }: SortableWidgetProps) => {
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
    touchAction: 'none',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Widget
        id={widget.id}
        title={widget.title}
        onRemove={onRemove}
        onEdit={onEdit}
      >
        <WidgetContent config={widget} />
      </Widget>
    </div>
  );
};