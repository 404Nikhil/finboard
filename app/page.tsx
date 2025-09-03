'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { useWidgetStore } from '@/store/widgetStore';
import { Modal } from '@/components/Modal';
import { AddWidgetForm } from '@/components/AddWidgetForm';
import { WidgetConfig } from '@/types/widget';
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
      updateWidget(editingWidgetId, { ...config } as Partial<WidgetConfig>);
    } else {
      addWidget(config);
    }
    handleCloseModal();
  };

  const widgetToEdit = editingWidgetId ? widgets.find(w => w.id === editingWidgetId) : undefined;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);

      const reorderedWidgets = arrayMove(widgets, oldIndex, newIndex);
      setWidgets(reorderedWidgets);
    }
  };

  // const getWidgetTypeIcon = (type: WidgetConfig['type']) => {
  //   switch (type) {
  //     case 'COMPANY_OVERVIEW':
  //       return '';
  //     case 'CHART':
  //       return '';
  //     case 'TABLE':
  //       return '';
  //     case 'FINANCE_CARD':
  //       return '';
  //     default:
  //       return '';
  //   }
  // };

  const getWidgetTypeLabel = (type: WidgetConfig['type']) => {
    switch (type) {
      case 'COMPANY_OVERVIEW':
        return 'Company Overview';
      case 'CHART':
        return 'Stock Chart';
      case 'TABLE':
        return 'Data Table';
      case 'FINANCE_CARD':
        return 'Finance Card';
      default:
        return 'Unknown Widget';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0D1117] to-gray-900">
      <Header onAddWidgetClick={() => handleOpenModal()} />
      
      <main className="p-4 md:p-8">
        {/* Dashboard Stats */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Finance Dashboard</h1>
              <p className="text-gray-400 text-sm">
                {widgets.length} active widget{widgets.length !== 1 ? 's' : ''} • Real-time data
              </p>
            </div>
          </div>
        </div>

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
                  className="group bg-white/5 dark:bg-[#161B22] border-2 border-dashed border-gray-600 hover:border-green-500 rounded-lg p-6 min-h-[200px] cursor-pointer hover:bg-white/10 dark:hover:bg-[#1C2128] transition-all duration-300 flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gradient-to-br from-green-600 to-blue-600 rounded-full text-white text-2xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      +
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Add Widget</h3>
                    <p className="text-sm text-gray-400 mb-3">Connect to a financial API and create a custom widget</p>
                    
                    <div className="flex justify-center space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      {/* {(['COMPANY_OVERVIEW', 'CHART', 'TABLE', 'FINANCE_CARD'] as const).map((type) => (
                        // <div key={type} className="text-xs bg-gray-700 rounded px-2 py-1 flex items-center space-x-1">
                        //   <span>{getWidgetTypeIcon(type)}</span>
                        //   <span className="hidden sm:inline">{getWidgetTypeLabel(type).split(' ')[0]}</span>
                        // </div>
                      ))} */}
                    </div>
                  </div>
                </div>
              </div>
            </SortableContext>
          </DndContext>
        </ClientOnly>

        {widgets.length === 0 && (
          <div className="text-center py-20">
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                📊
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Welcome to FinBoard</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Create your personalized financial dashboard by adding widgets that connect to various APIs. 
              Track stocks, cryptocurrencies, market data, and more in real-time.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Create Your First Widget
            </button>
          </div>
        )}
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