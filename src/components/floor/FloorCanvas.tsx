'use client';

import React from 'react';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useFloorStore } from '@/stores/floorStore';
import { Table } from './Table';

interface FloorCanvasProps {
  isEditMode?: boolean;
}

export function FloorCanvas({ isEditMode = false }: FloorCanvasProps) {
  const { activeFloorPlan } = useFloorStore();

  if (!activeFloorPlan) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-500 text-lg">
        No floor plan selected
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-auto bg-gray-950 border border-gray-800 rounded-lg shadow-inner">
      {/* Optional: Grid background for edit mode */}
      {isEditMode && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
      )}
      
      <div className="relative w-[2000px] h-[2000px] transform origin-top-left">
        {activeFloorPlan.elements.map((table) => (
          <Table key={table.id} table={table} isEditMode={isEditMode} />
        ))}
      </div>
    </div>
  );
}
