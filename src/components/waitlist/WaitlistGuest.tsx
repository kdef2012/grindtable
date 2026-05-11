'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Users, GripVertical } from 'lucide-react';
import { WaitlistEntry, useWaitlistStore } from '@/stores/waitlistStore';
import { useFloorStore } from '@/stores/floorStore';

interface WaitlistGuestProps {
  entry: WaitlistEntry;
}

export function WaitlistGuest({ entry }: WaitlistGuestProps) {
  const { isEditMode } = useFloorStore();
  const [mounted, setMounted] = React.useState(false);
  const [waitTime, setWaitTime] = React.useState(0);

  React.useEffect(() => {
    setMounted(true);
    const calculateTime = () => setWaitTime(Math.floor((Date.now() - entry.createdAt) / 60000));
    calculateTime();
    const interval = setInterval(calculateTime, 60000); // update every minute
    return () => clearInterval(interval);
  }, [entry.createdAt]);

  const isOverdue = waitTime > entry.quotedTime;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `guest_${entry.id}`,
    data: {
      type: 'waitlist_guest',
      entry,
    },
    disabled: isEditMode, // Don't drag guests while editing floor plan
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  } : undefined;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`bg-gray-900 border ${isDragging ? 'border-amber-500 shadow-xl' : 'border-gray-700 hover:border-gray-500'} rounded-lg p-3 transition-colors relative overflow-hidden flex gap-2`}
      {...attributes}
    >
      {!isEditMode && (
        <div 
          className="flex items-center justify-center text-gray-600 hover:text-gray-300 cursor-grab active:cursor-grabbing"
          {...listeners}
        >
          <GripVertical size={16} />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        {entry.status === 'notified' && (
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
        )}
        <div className="flex justify-between items-start mb-1 gap-2">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="font-bold truncate">{entry.name} Party</span>
            {entry.isVIP && (
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30">VIP</span>
            )}
            {entry.hasPreOrder && (
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">Pre-Order</span>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded font-medium whitespace-nowrap ${isOverdue ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-300'}`}>
            {mounted ? `${waitTime}m / ${entry.quotedTime}m` : `--m / ${entry.quotedTime}m`}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1"><Users size={14} /> {entry.partySize}</span>
            {entry.notes && <span className="text-xs italic truncate max-w-[100px]">— {entry.notes}</span>}
          </div>
          {entry.status === 'waiting' && (
            <button 
              onClick={(e) => { e.stopPropagation(); useWaitlistStore.getState().notifyGuest(entry.id); }}
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors z-10 relative"
            >
              SMS Ready
            </button>
          )}
          {entry.status === 'notified' && (
            <span className="text-xs text-blue-400 italic">Notified</span>
          )}
        </div>
      </div>
    </div>
  );
}
