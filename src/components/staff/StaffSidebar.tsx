'use client';

import React, { useState } from 'react';
import { useStaffStore } from '@/stores/staffStore';
import { useDraggable } from '@dnd-kit/core';
import { StaffMember } from '@/types';
import { UserPlus, UserMinus, GripVertical, Check } from 'lucide-react';

function StaffDraggable({ staff }: { staff: StaffMember }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `staff_${staff.id}`,
    data: { type: 'staff', staff },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`relative flex items-center justify-between p-3 rounded-lg border border-gray-700 bg-gray-800 shadow-sm transition-all hover:bg-gray-700 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 scale-105' : 'opacity-100'}`}
    >
      <div className="flex items-center gap-3">
        <GripVertical size={16} className="text-gray-500" />
        <div className={`w-4 h-4 rounded-full ${staff.color} border border-black/50 shadow-inner`} />
        <span className="font-bold text-sm tracking-wide text-gray-200">{staff.name}</span>
      </div>
      <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Drag to assign</div>
    </div>
  );
}

export function StaffSidebar() {
  const { staff, isStaffSidebarOpen, addStaff, removeStaff } = useStaffStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  
  const colors = [
    'bg-rose-500', 'bg-pink-500', 'bg-fuchsia-500', 'bg-purple-500', 
    'bg-violet-500', 'bg-indigo-500', 'bg-blue-500', 'bg-sky-500', 
    'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500', 'bg-green-500', 
    'bg-lime-500', 'bg-yellow-500', 'bg-amber-500', 'bg-orange-500'
  ];

  if (!isStaffSidebarOpen) return null;

  const handleAdd = () => {
    if (!newName.trim()) return;
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    addStaff({
      id: `s_${Date.now()}`,
      name: newName.trim(),
      color: randomColor,
      isActive: true,
    });
    setNewName('');
    setIsAdding(false);
  };

  return (
    <aside className="w-80 glass-panel border-l border-gray-800/50 flex flex-col z-20 shrink-0">
      <div className="p-4 border-b border-gray-800/50 flex items-center justify-between">
        <h2 className="font-bold text-lg">Servers On Shift</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-1.5 hover:bg-gray-800 rounded-md transition-colors text-amber-500"
        >
          <UserPlus size={18} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isAdding && (
          <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg space-y-2 mb-4">
            <input 
              autoFocus
              className="w-full bg-gray-950 border border-gray-700 rounded text-sm px-3 py-2 text-white focus:border-amber-500"
              placeholder="Server Name..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') setIsAdding(false);
              }}
            />
            <div className="flex gap-2">
              <button onClick={handleAdd} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-1.5 rounded text-xs">Add</button>
              <button onClick={() => setIsAdding(false)} className="px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded text-xs">Cancel</button>
            </div>
          </div>
        )}

        {staff.filter(s => s.isActive).map(s => (
          <div key={s.id} className="group relative">
            <StaffDraggable staff={s} />
            <button 
              onClick={() => removeStaff(s.id)}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 z-10"
              title="Remove Server"
            >
              <UserMinus size={12} />
            </button>
          </div>
        ))}

        {staff.length === 0 && !isAdding && (
          <div className="text-center text-gray-500 mt-8 text-sm">No servers on shift</div>
        )}
      </div>
    </aside>
  );
}
