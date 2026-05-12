'use client';

import React from 'react';
import { useFloorStore } from '@/stores/floorStore';
import { X, Trash2, AlertTriangle, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { setActiveFloorPlan } = useFloorStore();

  if (!isOpen) return null;

  const handleWipe = () => {
    if (confirm("Are you SURE you want to wipe the entire floor plan? This will delete all tables and cannot be undone.")) {
      setActiveFloorPlan({
        id: 'plan_1',
        name: 'Main Dining Floor',
        isActive: true,
        createdAt: Date.now(),
        elements: []
      });
      onClose();
    }
  };

  const handleResetToDefault = () => {
    if (confirm("Are you sure you want to reset the floor plan to the default template?")) {
      setActiveFloorPlan({
        id: 'plan_1',
        name: 'Main Dining Floor',
        isActive: true,
        createdAt: Date.now(),
        elements: [
          { id: 't1', number: '11', capacity: 4, type: '4_top', shape: 'square', zone: 'main', position: { x: 100, y: 100 }, currentStatus: 'available' },
          { id: 't2', number: '12', capacity: 4, type: '4_top', shape: 'square', zone: 'main', position: { x: 300, y: 100 }, currentStatus: 'occupied', seatedAt: Date.now() - 1000 * 60 * 30 },
          { id: 't3', number: '13', capacity: 2, type: '2_top', shape: 'round', zone: 'main', position: { x: 500, y: 120 }, currentStatus: 'dirty' },
          { id: 't4', number: 'B1', capacity: 6, type: 'booth', shape: 'rectangle', zone: 'booths', position: { x: 100, y: 300 }, currentStatus: 'reserved' },
          { id: 't5', number: 'B2', capacity: 6, type: 'booth', shape: 'rectangle', zone: 'booths', position: { x: 300, y: 300 }, currentStatus: 'available' },
          { id: 't6', number: '21', capacity: 8, type: '8_top', shape: 'round', zone: 'private', position: { x: 700, y: 200 }, currentStatus: 'check_dropped' },
        ]
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-dark w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-gray-800 p-6 bg-gray-900/50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Settings & Danger Zone
          </h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-4">
            <AlertTriangle className="text-red-500 shrink-0" size={24} />
            <div>
              <h3 className="text-red-500 font-bold mb-1">Wipe Floor Plan</h3>
              <p className="text-sm text-gray-400 mb-4">This will permanently delete all tables from the database. You will start with a completely blank canvas.</p>
              <button 
                onClick={handleWipe}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors text-sm w-full justify-center"
              >
                <Trash2 size={16} /> Delete Everything
              </button>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-4">
            <RotateCcw className="text-amber-500 shrink-0" size={24} />
            <div>
              <h3 className="text-amber-500 font-bold mb-1">Reset to Default</h3>
              <p className="text-sm text-gray-400 mb-4">Restore the original mock floor plan template with 6 pre-configured tables.</p>
              <button 
                onClick={handleResetToDefault}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors text-sm w-full justify-center"
              >
                <RotateCcw size={16} /> Reset Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
