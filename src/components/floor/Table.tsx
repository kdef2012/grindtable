'use client';

import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { TableElement, TableStatus } from '@/types';
import { cn } from '@/lib/utils';
import { useFloorStore } from '@/stores/floorStore';

interface TableProps {
  table: TableElement;
  isEditMode?: boolean;
}

const statusColors: Record<TableStatus, string> = {
  available: 'bg-green-500 border-green-600',
  reserved: 'bg-yellow-500 border-yellow-600',
  occupied: 'bg-red-500 border-red-600',
  ordering: 'bg-blue-500 border-blue-600',
  check_dropped: 'bg-orange-500 border-orange-600',
  dirty: 'bg-gray-800 border-gray-600 text-white',
  blocked: 'bg-purple-500 border-purple-600',
};

export function Table({ table, isEditMode = false }: TableProps) {
  const { attributes, listeners, setNodeRef: setDraggableRef, transform } = useDraggable({
    id: table.id,
    data: { type: 'table' },
    disabled: !isEditMode,
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: table.id,
    data: { type: 'table', table },
    disabled: isEditMode || table.currentStatus !== 'available', // Only droppable when available and not editing
  });

  const setNodeRef = (node: HTMLElement | null) => {
    setDraggableRef(node);
    setDroppableRef(node);
  };

  const style = {
    position: 'absolute' as const,
    left: table.position.x,
    top: table.position.y,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    width: table.width || getTableWidth(table),
    height: table.height || getTableHeight(table),
    zIndex: transform ? 50 : 10,
  };

  const colorClass = isEditMode ? 'bg-gray-700 border-gray-500 text-white' : statusColors[table.currentStatus];

  const { setSelectedTableId } = useFloorStore();

  const handleClick = () => {
    // Prevent opening modal if actively dragging
    if (transform) return;
    setSelectedTableId(table.id);
  };

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      style={style}
      className={cn(
        'absolute flex items-center justify-center shadow-md cursor-pointer transition-colors',
        getTableShapeClass(table),
        colorClass,
        table.type === 'restroom' && 'bg-blue-900 border-4 border-blue-700 text-blue-200',
        table.type === 'bar' && 'bg-amber-900 border-4 border-amber-700 text-amber-200',
        isEditMode && 'cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-blue-400',
        isOver && !isEditMode && 'ring-4 ring-amber-500 scale-105',
        (!isEditMode && table.type === 'restroom') && 'pointer-events-none opacity-80', // users can't interact with restrooms outside edit mode
        (!isEditMode && table.type === 'bar') && 'pointer-events-none opacity-80'
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex flex-col items-center justify-center w-full px-1 overflow-hidden z-10 relative">
        <span className="font-bold text-sm select-none">{table.number}</span>
        {!isEditMode && table.currentPartyName && table.type !== 'restroom' && table.type !== 'bar' && (
          <div className="flex flex-col items-center">
            <span className="text-[10px] truncate w-full text-center font-medium bg-black/20 rounded mt-0.5 px-0.5">
              {table.currentPartyName}
            </span>
            {table.currentStatus === 'occupied' && table.seatedAt && (
              <span className="text-[8px] mt-0.5 opacity-80 animate-pulse">
                ~{Math.max(0, 45 - Math.floor((Date.now() - table.seatedAt) / 60000))}m left
              </span>
            )}
          </div>
        )}
      </div>
      {table.type && (
        <span className="absolute top-1 left-1 text-[8px] uppercase font-bold opacity-60 tracking-tighter select-none z-10">
          {table.type.replace('_top', '').replace('_seat', '').replace('_booth', '')}
        </span>
      )}
      {!isEditMode && table.capacity > 0 && table.type !== 'restroom' && (
        <span className="absolute bottom-1 right-1 text-[10px] opacity-70 select-none z-10">
          {table.capacity}
        </span>
      )}
    </div>
  );
}

function getTableWidth(table: TableElement) {
  switch (table.type) {
    case '2_top': return 60;
    case '4_top': return 80;
    case '6_top': return 100;
    case '8_top': return 120;
    case '4_booth': return 80;
    case 'booth': return 100; // 6 person
    case 'restroom': return 120;
    case 'bar': 
      // width scales with capacity for simple rectangular bars
      if (table.shape === 'horseshoe') return 160;
      return Math.max(100, (table.capacity * 30)); 
    default: return 80;
  }
}

function getTableHeight(table: TableElement) {
  switch (table.type) {
    case '2_top': return 60;
    case '4_top': return 80;
    case '6_top': return 80;
    case '8_top': return 80;
    case '4_booth': return 80;
    case 'booth': return 100;
    case 'restroom': return 120;
    case 'bar': 
      if (table.shape === 'horseshoe') return 120;
      return 60;
    default: return 80;
  }
}

function getTableShapeClass(table: TableElement) {
  switch (table.shape) {
    case 'round': return 'rounded-full border-2';
    case 'square': return 'rounded-md border-2';
    case 'rectangle': return 'rounded-md border-2';
    case 'l_shaped': return 'rounded-md border-2 rounded-tr-[50px]'; // Fake L
    case 'u_shaped': return 'rounded-b-3xl border-2 border-t-0'; // U shape
    case 'horseshoe': return 'rounded-t-full border-4 border-b-0'; // Horseshoe
    default: return 'rounded-md border-2';
  }
}
