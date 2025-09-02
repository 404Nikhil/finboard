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

export default function Home() {
  const { widgets, addWidget, removeWidget } = useWidgetStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddWidget = (config: Omit<WidgetConfig, 'id'>) => {
    addWidget(config);
    setIsModalOpen(false);
  };
  return (
    <div className="min-h-screen">
      <Header onAddWidgetClick={() => setIsModalOpen(true)} />
      <main className="p-8">
        <ClientOnly>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {widgets.map((widget) => (
            <Widget
              key={widget.id}
              id={widget.id}
              title={widget.title}
              onRemove={removeWidget}
            >
              <WidgetContent
                type={widget.type}
                params={widget.params}
                refreshInterval={widget.refreshInterval}
              />
            </Widget>
          ))}

          <div
            onClick={() => setIsModalOpen(true)}
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
        </ClientOnly>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Widget">
        <AddWidgetForm 
          onSubmit={handleAddWidget} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}