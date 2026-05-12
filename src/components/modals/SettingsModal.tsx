'use client';

import React from 'react';
import { useFloorStore } from '@/stores/floorStore';
import { X, Trash2, AlertTriangle, RotateCcw, Map } from 'lucide-react';
import { getKbjWinstonSalemLayout } from '@/lib/kbjLayout';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { setActiveFloorPlan } = useFloorStore();

  if (!isOpen) return null;

  const handleWipe = () => {
    setActiveFloorPlan({
      id: 'plan_1',
      name: 'Main Dining Floor',
      isActive: true,
      createdAt: Date.now(),
      elements: []
    });
    onClose();
  };

  const handleLoadKbj = () => {
    setActiveFloorPlan({
      id: 'plan_1',
      name: 'KBJ Winston-Salem',
      isActive: true,
      createdAt: Date.now(),
      elements: getKbjWinstonSalemLayout()
    });
    onClose();
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

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-4">
            <Map className="text-blue-500 shrink-0" size={24} />
            <div>
              <h3 className="text-blue-500 font-bold mb-1">Load KBJ Layout</h3>
              <p className="text-sm text-gray-400 mb-4">Automatically generate the exact Winston-Salem KBJ floorplan layout from the provided blueprint.</p>
              <button 
                onClick={handleLoadKbj}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors text-sm w-full justify-center"
              >
                <Map size={16} /> Generate Floorplan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
