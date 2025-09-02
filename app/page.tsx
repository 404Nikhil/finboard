'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Widget } from '@/components/Widget';
import { useWidgetStore } from '@/store/widgetStore';
import { Modal } from '@/components/Modal';
import { AddWidgetForm } from '@/components/AddWidgetForm';
import { WidgetConfig } from '@/types/widget';
import { WidgetContent } from '@/components/WidgetContent';
import { ClientOnly } from '@/components/ClientOnly';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableWidget } from '@/components/SortableWidget';

export default function Home() {
  const { widgets, addWidget, removeWidget, setWidgets, updateWidget } = useWidgetStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);

  const handleOpenModal = (widgetId?: string) => {
    setEditingWidgetId(widgetId || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingWidgetId(null);
    setIsModalOpen(false);
  };

  const handleFormSubmit = (config: Omit<WidgetConfig, 'id'>) => {
    if (editingWidgetId) {
      updateWidget(editingWidgetId, config);
    } else {
      addWidget(config);
    }
    handleCloseModal();
  };

  const widgetToEdit = editingWidgetId ? widgets.find(w => w.id === editingWidgetId) : undefined;

  const handleAddWidget = (config: Omit<WidgetConfig, 'id'>) => {
    addWidget(config);
    setIsModalOpen(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);

      const reorderedWidgets = arrayMove(widgets, oldIndex, newIndex);

      setWidgets(reorderedWidgets);
    }
  };
  return (
    <div className="min-h-screen">
      <Header onAddWidgetClick={() => handleOpenModal()} />
      <main className="p-8">
        <ClientOnly>
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {widgets.map((widget) => (
                  <SortableWidget
                    key={widget.id}
                    widget={widget}
                    onEdit={handleOpenModal}
                    onRemove={removeWidget}
                  />
                ))}

                <div
                  onClick={() => handleOpenModal()}
                  className="flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-4 min-h-[200px] cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  <div className="text-center">
                    <div className="mx-auto w-12 h-12 flex items-center justify-center bg-gray-700 rounded-full text-2xl font-bold">
                      +
                    </div>
                    <p className="mt-2 font-semibold">Add Widget</p>
                    <p className="text-sm text-gray-400">Connect to an API</p>
                  </div>
                </div>
              </div>
            </SortableContext>
          </DndContext>
        </ClientOnly>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingWidgetId ? "Edit Widget" : "Add New Widget"}
      >
        <AddWidgetForm
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          initialData={widgetToEdit}
        />
      </Modal>
    </div>
  );
}