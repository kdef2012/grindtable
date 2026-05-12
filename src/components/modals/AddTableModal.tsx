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
  { type: '4_booth', label: '4-Booth', capacity: 4, shape: 'rectangle' },
  { type: 'booth', label: '6-Booth', capacity: 6, shape: 'rectangle' },
  { type: 'bar', label: 'Build Bar', capacity: 10, shape: 'rectangle' },
  { type: 'bar_seat', label: 'Single Bar Seat', capacity: 1, shape: 'round' },
  { type: 'restroom', label: 'Restroom Block', capacity: 0, shape: 'square' },
];

const BAR_SHAPES: { shape: TableShape; label: string }[] = [
  { shape: 'rectangle', label: 'Straight Rectangle' },
  { shape: 'horseshoe', label: 'Horseshoe' },
  { shape: 'u_shaped', label: 'U-Shaped' },
  { shape: 'l_shaped', label: 'L-Shaped' }
];

export function AddTableModal({ isOpen, onClose }: AddTableModalProps) {
  const { addTable } = useFloorStore();
  const [number, setNumber] = useState('');
  const [selectedType, setSelectedType] = useState<TableType>('4_top');
  
  // Custom Bar States
  const [barShape, setBarShape] = useState<TableShape>('rectangle');
  const [barCapacity, setBarCapacity] = useState<number>(10);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!number) return;
    
    const typeDef = TABLE_TYPES.find(t => t.type === selectedType)!;
    
    const finalShape = selectedType === 'bar' ? barShape : typeDef.shape;
    const finalCapacity = selectedType === 'bar' ? barCapacity : typeDef.capacity;

    addTable({
      id: `t_${Math.random().toString(36).substr(2, 9)}`,
      number,
      capacity: finalCapacity,
      type: selectedType,
      shape: finalShape,
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
          <h2 className="text-xl font-bold flex items-center gap-2">Add Floor Element</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-800 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Element Label (e.g. 15, Bar, RR)</label>
            <input 
              required
              autoFocus
              type="text" 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              placeholder="e.g. 15 or RR"
              value={number}
              onChange={e => setNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Element Type</label>
            <div className="grid grid-cols-3 gap-2">
              {TABLE_TYPES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setSelectedType(t.type)}
                  className={`p-2 border rounded-lg text-sm transition-colors text-left ${selectedType === t.type ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-gray-700 hover:border-gray-500 text-gray-300'}`}
                >
                  <div className="font-bold">{t.label}</div>
                  {t.capacity > 0 && <div className="text-[10px] opacity-70">{t.capacity} seats</div>}
                </button>
              ))}
            </div>
          </div>

          {selectedType === 'bar' && (
            <div className="p-3 bg-gray-900 border border-gray-700 rounded-lg space-y-3 animate-in slide-in-from-top-2">
              <h3 className="font-bold text-sm text-amber-500 mb-2">Bar Configuration</h3>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Bar Shape</label>
                <div className="grid grid-cols-2 gap-2">
                  {BAR_SHAPES.map((s) => (
                    <button
                      key={s.shape}
                      type="button"
                      onClick={() => setBarShape(s.shape)}
                      className={`p-2 border rounded text-xs transition-colors ${barShape === s.shape ? 'border-amber-500 bg-amber-500/20 text-white' : 'border-gray-700 text-gray-400'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Number of Bar Seats</label>
                <input 
                  type="number" 
                  min="2" max="50"
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  value={barCapacity}
                  onChange={e => setBarCapacity(parseInt(e.target.value) || 10)}
                />
              </div>
            </div>
          )}

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
