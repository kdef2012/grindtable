'use client';

import React from 'react';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useFloorStore } from '@/stores/floorStore';
import { Table } from './Table';
import { cn } from '@/lib/utils';

interface FloorCanvasProps {
  isEditMode?: boolean;
}

export function FloorCanvas({ isEditMode = false }: FloorCanvasProps) {
  const { activeFloorPlan } = useFloorStore();
  const [zoom, setZoom] = React.useState(1);

  if (!activeFloorPlan) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-500 text-lg">
        No floor plan selected
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-950 border border-gray-800 shadow-inner flex flex-col">
      {/* Controls */}
      <div className="absolute bottom-6 right-6 z-40 flex items-center gap-4">
        {isEditMode && (
          <div className="glass-dark border border-gray-700 rounded-full px-4 py-2 flex items-center gap-3 shadow-2xl">
            <button 
              onClick={() => useFloorStore.getState().setIsMultiSelectMode(!useFloorStore.getState().isMultiSelectMode)}
              className={cn(
                "text-xs font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-2",
                useFloorStore.getState().isMultiSelectMode ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]" : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              )}
            >
              {useFloorStore.getState().isMultiSelectMode ? "✅ MULTI-SELECT ON" : "☑️ MULTI-SELECT OFF"}
            </button>
            {useFloorStore.getState().selectedTableIds.length > 0 && (
              <span className="text-xs font-bold text-blue-400">
                {useFloorStore.getState().selectedTableIds.length} Selected
              </span>
            )}
          </div>
        )}

        <div className="glass-dark border border-gray-700 rounded-full px-4 py-2 flex items-center gap-3 shadow-2xl">
          <span className="text-xs font-bold text-gray-400">ZOOM</span>
          <input 
            type="range" 
            min="0.3" 
            max="1.5" 
            step="0.1" 
            value={zoom} 
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-24 accent-amber-500"
          />
          <span className="text-xs font-bold text-gray-300 w-8">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(1)} className="text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded transition-colors text-white">Reset</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        {/* Visual Grid for edit mode */}
        {isEditMode && (
          <div 
            className="absolute top-0 left-0 w-[4000px] h-[4000px] pointer-events-none opacity-20 origin-top-left"
            style={{
              backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              transform: `scale(${zoom})`,
            }}
          />
        )}
        
        <div 
          className="relative w-[4000px] h-[4000px] origin-top-left transition-transform duration-75"
          style={{ transform: `scale(${zoom})` }}
        >
          {activeFloorPlan.elements.map((table) => (
            <Table key={table.id} table={table} isEditMode={isEditMode} />
          ))}
        </div>
      </div>
    </div>
  );
}
