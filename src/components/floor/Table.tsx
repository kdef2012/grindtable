'use client';

import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { TableElement, TableStatus, TableType } from '@/types';
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
  const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({
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

  const { selectedTableIds, dragDelta, toggleTableSelection, setSelectedTableId } = useFloorStore();

  const isSelectedForMulti = selectedTableIds.includes(table.id);
  const isDraggingGroupMember = isSelectedForMulti && dragDelta && !transform;

  const style = {
    position: 'absolute' as const,
    transform: transform 
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)` 
      : isDraggingGroupMember 
        ? `translate3d(${dragDelta.x}px, ${dragDelta.y}px, 0)` 
        : undefined,
    width: table.width || getTableWidth(table),
    height: table.height || getTableHeight(table),
    left: table.position.x,
    top: table.position.y,
    zIndex: isDragging || isDraggingGroupMember ? 50 : 10,
  };

  const handleInteract = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditMode) {
      if (table.type === 'structural' || table.type === 'bar') return;
      setSelectedTableId(table.id);
    } else {
      if (useFloorStore.getState().isMultiSelectMode) {
        toggleTableSelection(table.id);
      } else {
        setSelectedTableId(table.id);
      }
    }
  };

  const colorClass = isEditMode 
    ? 'bg-gray-800 border-gray-600 text-white' 
    : statusColors[table.currentStatus];
  const realisticTexture = table.type !== 'structural' ? "shadow-[inset_0_-2px_6px_rgba(0,0,0,0.6),0_4px_8px_rgba(0,0,0,0.5)] bg-gradient-to-br from-white/10 to-transparent" : "";

  return (
    <div
      ref={setNodeRef}
      onClick={handleInteract}
      style={style}
      className={cn(
        'absolute flex items-center justify-center cursor-pointer transition-colors border-2',
        getTableShapeClass(table),
        colorClass,
        realisticTexture,
        (table.type === 'restroom' || table.type === 'structural') && 'bg-slate-900 border-4 border-slate-700 text-slate-300',
        table.type === 'bar' && 'bg-stone-900 border-4 border-amber-900 text-stone-400',
        isEditMode && 'cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-blue-400',
        isSelectedForMulti && isEditMode && 'ring-4 ring-blue-500 scale-105 shadow-blue-500/50',
        isOver && !isEditMode && 'ring-4 ring-amber-500 scale-105',
        (!isEditMode && (table.type === 'restroom' || table.type === 'structural')) && 'pointer-events-none opacity-80',
        (!isEditMode && table.type === 'bar') && 'pointer-events-none opacity-80'
      )}
      {...attributes}
      {...listeners}
    >
      {/* Realistic Chairs */}
      <ChairsRenderer table={table} />

      <div className="flex flex-col items-center justify-center w-full px-1 overflow-hidden z-20 relative mix-blend-plus-lighter text-shadow">
        <span className="font-extrabold text-sm select-none drop-shadow-md">{table.number}</span>
        {!isEditMode && table.currentPartyName && table.type !== 'restroom' && table.type !== 'structural' && table.type !== 'bar' && (
          <div className="flex flex-col items-center">
            <span className="text-[10px] truncate w-full text-center font-bold bg-black/40 rounded mt-0.5 px-0.5 shadow-sm">
              {table.currentPartyName}
            </span>
            {table.currentStatus === 'occupied' && table.seatedAt && (
              <span className="text-[8px] mt-0.5 opacity-90 animate-pulse font-medium">
                ~{Math.max(0, 45 - Math.floor((Date.now() - table.seatedAt) / 60000))}m left
              </span>
            )}
          </div>
        )}
      </div>
      {table.type && table.type !== 'structural' && (
        <span className="absolute top-1 left-1 text-[8px] uppercase font-bold opacity-60 tracking-tighter select-none z-10 drop-shadow-sm">
          {table.type.replace('_top', '').replace('_seat', '').replace('_booth', '')}
        </span>
      )}
      {!isEditMode && table.capacity > 0 && table.type !== 'restroom' && table.type !== 'structural' && (
        <span className="absolute bottom-1 right-1 text-[10px] font-bold opacity-70 select-none z-10">
          {table.capacity}
        </span>
      )}
    </div>
  );
}

function ChairsRenderer({ table }: { table: TableElement }) {
  if (table.type === 'restroom' || table.type === 'structural' || table.type === 'bar') return null;
  if (table.capacity === 0) return null;

  const chairs = [];
  const chairClass = "absolute bg-gray-800 border-2 border-gray-900 shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-0";
  const isVert = table.orientation === 'vertical';

  if (table.type === '2_top') {
    if (isVert) {
      chairs.push(<div key={0} className={`${chairClass} w-4 h-6 rounded-l-full -left-4 top-1/2 -translate-y-1/2`} />);
      chairs.push(<div key={1} className={`${chairClass} w-4 h-6 rounded-r-full -right-4 top-1/2 -translate-y-1/2`} />);
    } else {
      chairs.push(<div key={0} className={`${chairClass} w-6 h-4 rounded-t-full -top-4 left-1/2 -translate-x-1/2`} />);
      chairs.push(<div key={1} className={`${chairClass} w-6 h-4 rounded-b-full -bottom-4 left-1/2 -translate-x-1/2`} />);
    }
  } else if (table.type === '4_top') {
    if (isVert) {
      chairs.push(<div key={0} className={`${chairClass} w-4 h-6 rounded-l-full -left-4 top-[25%] -translate-y-1/2`} />);
      chairs.push(<div key={1} className={`${chairClass} w-4 h-6 rounded-l-full -left-4 top-[75%] -translate-y-1/2`} />);
      chairs.push(<div key={2} className={`${chairClass} w-4 h-6 rounded-r-full -right-4 top-[25%] -translate-y-1/2`} />);
      chairs.push(<div key={3} className={`${chairClass} w-4 h-6 rounded-r-full -right-4 top-[75%] -translate-y-1/2`} />);
    } else {
      chairs.push(<div key={0} className={`${chairClass} w-6 h-4 rounded-t-full -top-4 left-[25%] -translate-x-1/2`} />);
      chairs.push(<div key={1} className={`${chairClass} w-6 h-4 rounded-t-full -top-4 left-[75%] -translate-x-1/2`} />);
      chairs.push(<div key={2} className={`${chairClass} w-6 h-4 rounded-b-full -bottom-4 left-[25%] -translate-x-1/2`} />);
      chairs.push(<div key={3} className={`${chairClass} w-6 h-4 rounded-b-full -bottom-4 left-[75%] -translate-x-1/2`} />);
    }
  } else if (table.type === '6_top' || table.type === '8_top' || table.type === '10_top') {
    const totalSides = table.capacity === 10 ? 5 : table.capacity === 6 ? 3 : 4;
    for (let i=0; i<totalSides; i++) {
      let pos = '50%';
      if (totalSides === 3) pos = (i === 0 ? '20%' : i === 1 ? '50%' : '80%');
      else if (totalSides === 4) pos = (i === 0 ? '15%' : i === 1 ? '38%' : i === 2 ? '62%' : '85%');
      else if (totalSides === 5) pos = (i === 0 ? '10%' : i === 1 ? '30%' : i === 2 ? '50%' : i === 3 ? '70%' : '90%');

      if (isVert) {
        chairs.push(<div key={`l${i}`} className={`${chairClass} w-4 h-6 rounded-l-full -left-4`} style={{ top: pos, transform: 'translateY(-50%)' }} />);
        chairs.push(<div key={`r${i}`} className={`${chairClass} w-4 h-6 rounded-r-full -right-4`} style={{ top: pos, transform: 'translateY(-50%)' }} />);
      } else {
        chairs.push(<div key={`t${i}`} className={`${chairClass} w-6 h-4 rounded-t-full -top-4`} style={{ left: pos, transform: 'translateX(-50%)' }} />);
        chairs.push(<div key={`b${i}`} className={`${chairClass} w-6 h-4 rounded-b-full -bottom-4`} style={{ left: pos, transform: 'translateX(-50%)' }} />);
      }
    }
  } else if (table.type === 'booth' || table.type === '4_booth') {
    if (isVert) {
      const benchClass = "absolute bg-amber-950 border-2 border-black/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] h-[90%] top-[5%] w-6 rounded-sm z-0";
      chairs.push(<div key="l" className={`${benchClass} -left-5 rounded-l-lg`} />);
      chairs.push(<div key="r" className={`${benchClass} -right-5 rounded-r-lg`} />);
    } else {
      const benchClass = "absolute bg-amber-950 border-2 border-black/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] w-[90%] left-[5%] h-6 rounded-sm z-0";
      chairs.push(<div key="t" className={`${benchClass} -top-5 rounded-t-lg`} />);
      chairs.push(<div key="b" className={`${benchClass} -bottom-5 rounded-b-lg`} />);
    }
  } else if (table.type === 'bar_seat') {
    chairs.push(<div key={0} className={`absolute bg-stone-800 border-4 border-stone-900 w-8 h-8 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-xl z-0`} />);
  }

  return <>{chairs}</>;
}

function getTableWidth(table: TableElement) {
  let w = 80;
  switch (table.type) {
    case '2_top': w = 60; break;
    case '4_top': w = 80; break; // 4x4
    case '6_top': w = 120; break; // 6x4
    case '8_top': w = 160; break; // 8x4
    case '10_top': w = 200; break; // 10x4
    case '4_booth': w = 80; break; // 4x5
    case 'booth': w = 120; break; // 6x5
    case 'restroom':
    case 'structural': w = 120; break;
    case 'bar': 
      if (table.shape === 'horseshoe') w = 160;
      else w = Math.max(100, (table.capacity * 30)); 
      break;
    default: w = 80; break;
  }
  // Swap width and height if vertical, EXCEPT for bar and structural which have explicit custom dimensions usually
  if (table.orientation === 'vertical' && table.type !== 'bar' && table.type !== 'structural') {
    return getTableHeightBase(table.type);
  }
  return w;
}

function getTableHeightBase(type: TableType) {
  switch (type) {
    case '2_top': return 60;
    case '4_top': return 80; // 4x4
    case '6_top': return 80; // 6x4
    case '8_top': return 80; // 8x4
    case '10_top': return 80; // 10x4
    case '4_booth': return 100; // 4x5
    case 'booth': return 100; // 6x5
    case 'restroom':
    case 'structural': return 120;
    case 'bar': return 60;
    default: return 80;
  }
}

function getTableHeight(table: TableElement) {
  let h = getTableHeightBase(table.type);
  if (table.type === 'bar' && table.shape === 'horseshoe') h = 120;

  if (table.orientation === 'vertical' && table.type !== 'bar' && table.type !== 'structural') {
    // If vertical, height becomes what width normally is
    let w = 80;
    switch (table.type) {
      case '2_top': w = 60; break;
      case '4_top': w = 80; break;
      case '6_top': w = 120; break;
      case '8_top': w = 160; break;
      case '10_top': w = 200; break;
      case '4_booth': w = 80; break;
      case 'booth': w = 120; break;
    }
    return w;
  }
  return h;
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
