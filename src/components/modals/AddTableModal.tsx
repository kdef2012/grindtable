'use client';

import React, { useState } from 'react';
import { useFloorStore } from '@/stores/floorStore';
import { X, Plus } from 'lucide-react';
import { TableShape, TableType } from '@/types';

interface AddTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABLE_TYPES: { type: TableType; label: string; capacity: number; shape: TableShape }[] = [
  { type: '2_top', label: '2-Top', capacity: 2, shape: 'square' },
  { type: '4_top', label: '4-Top', capacity: 4, shape: 'square' },
  { type: '6_top', label: '6-Top', capacity: 6, shape: 'rectangle' },
  { type: '8_top', label: '8-Top', capacity: 8, shape: 'round' },
  { type: 'booth', label: 'Booth', capacity: 6, shape: 'rectangle' },
  { type: 'bar_seat', label: 'Bar Seat', capacity: 1, shape: 'round' },
  { type: 'high_top', label: 'High Top', capacity: 4, shape: 'round' },
  { type: 'patio', label: 'Patio', capacity: 4, shape: 'square' },
];

export function AddTableModal({ isOpen, onClose }: AddTableModalProps) {
  const { addTable } = useFloorStore();
  const [number, setNumber] = useState('');
  const [selectedType, setSelectedType] = useState<TableType>('4_top');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!number) return;
    
    const typeDef = TABLE_TYPES.find(t => t.type === selectedType)!;

    addTable({
      id: `t_${Math.random().toString(36).substr(2, 9)}`,
      number,
      capacity: typeDef.capacity,
      type: selectedType,
      shape: typeDef.shape,
      zone: 'main',
      position: { x: 100, y: 100 }, // Defaults to top left, user will drag it
      currentStatus: 'available',
    });

    setNumber('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-dark w-full max-w-md rounded-xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <h2 className="text-xl font-bold flex items-center gap-2">Add New Table</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-800 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Table Number</label>
            <input 
              required
              autoFocus
              type="text" 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              placeholder="e.g. 15 or Bar-1"
              value={number}
              onChange={e => setNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Table Type</label>
            <div className="grid grid-cols-2 gap-2">
              {TABLE_TYPES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setSelectedType(t.type)}
                  className={`p-2 border rounded-lg text-sm transition-colors text-left ${selectedType === t.type ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-gray-700 hover:border-gray-500 text-gray-300'}`}
                >
                  <div className="font-bold">{t.label}</div>
                  <div className="text-[10px] opacity-70">{t.capacity} seats</div>
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold py-3 rounded-lg transition-colors mt-2"
          >
            <Plus size={18} /> Add to Floor Plan
          </button>
        </form>
      </div>
    </div>
  );
}
