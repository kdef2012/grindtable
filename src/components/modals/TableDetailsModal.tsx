'use client';

import React from 'react';
import { useFloorStore } from '@/stores/floorStore';
import { TableStatus } from '@/types';
import { X, Check, Utensils, Receipt, Brush, Ban, Clock } from 'lucide-react';

const STATUS_ACTIONS: { id: TableStatus; label: string; icon: React.FC<any>; color: string }[] = [
  { id: 'available', label: 'Available', icon: Check, color: 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 hover:border-green-500/50' },
  { id: 'reserved', label: 'Reserved', icon: Clock, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20 hover:border-yellow-500/50' },
  { id: 'occupied', label: 'Seat Guest', icon: Check, color: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/50' },
  { id: 'ordering', label: 'Ordering', icon: Utensils, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/50' },
  { id: 'check_dropped', label: 'Check Dropped', icon: Receipt, color: 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20 hover:border-orange-500/50' },
  { id: 'dirty', label: 'Bussing', icon: Brush, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20 hover:border-gray-500/50' },
  { id: 'blocked', label: 'Blocked', icon: Ban, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/50' },
];

export function TableDetailsModal() {
  const { selectedTableId, setSelectedTableId, activeFloorPlan, updateTableStatus, isEditMode } = useFloorStore();
  const [isDuplicating, setIsDuplicating] = React.useState(false);
  const [duplicateName, setDuplicateName] = React.useState('');

  if (!selectedTableId || !activeFloorPlan) return null;

  const table = activeFloorPlan.elements.find(t => t.id === selectedTableId);
  if (!table) return null;

  const handleDuplicate = () => {
    if (!duplicateName.trim()) return;
    useFloorStore.getState().addTable({
      ...table,
      id: `t_${Math.random().toString(36).substr(2, 9)}`,
      number: duplicateName.trim(),
      position: { x: table.position.x + 40, y: table.position.y + 40 },
      currentStatus: 'available',
      currentPartyName: undefined,
      currentPartyId: undefined,
      seatedAt: undefined,
    });
    setDuplicateName('');
    setIsDuplicating(false);
    setSelectedTableId(null);
  };

  const handleStatusChange = (status: TableStatus) => {
    updateTableStatus(table.id, status);
    setSelectedTableId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-dark w-full max-w-sm rounded-xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Table {table.number}
              <span className="text-xs font-normal text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                {table.capacity} Seats
              </span>
            </h2>
          </div>
          <button 
            onClick={() => setSelectedTableId(null)}
            className="rounded-full p-1 hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Change Status</p>
          <div className="grid grid-cols-2 gap-3">
            {STATUS_ACTIONS.map((action) => {
              const Icon = action.icon;
              const isActive = table.currentStatus === action.id;
              return (
                <button
                  key={action.id}
                  onClick={() => handleStatusChange(action.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${action.color} ${isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''}`}
                >
                  <Icon size={24} className="mb-2" />
                  <span className="text-xs font-bold text-center">{action.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                useFloorStore.getState().updateTable(table.id, {
                  capacity: table.capacity * 2,
                  shape: 'rectangle',
                  width: (table.width || 80) * 1.8,
                });
                setSelectedTableId(null);
              }}
              className="flex flex-col items-center justify-center p-3 rounded-lg border bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all col-span-2"
            >
              <span className="text-xs font-bold flex items-center gap-2">🔗 Merge with Nearest Table</span>
            </button>
            {isEditMode && (
              <>
                {isDuplicating ? (
                  <div className="col-span-2 bg-gray-900 border border-gray-700 p-3 rounded-lg space-y-3 mt-2 animate-in slide-in-from-top-2">
                    <label className="block text-xs font-bold text-gray-400">New Table Number</label>
                    <input 
                      autoFocus
                      type="text" 
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      placeholder="e.g. 15B"
                      value={duplicateName}
                      onChange={e => setDuplicateName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleDuplicate();
                        if (e.key === 'Escape') setIsDuplicating(false);
                      }}
                    />
                    <div className="flex gap-2">
                      <button onClick={handleDuplicate} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg transition-colors text-xs">
                        Confirm Duplicate
                      </button>
                      <button onClick={() => setIsDuplicating(false)} className="px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-lg transition-colors text-xs">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="col-span-2 grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => setIsDuplicating(true)}
                      className="flex flex-col items-center justify-center p-3 rounded-lg border bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all"
                    >
                      <span className="text-xs font-bold flex items-center gap-2">➕ Duplicate</span>
                    </button>
                    <button
                      onClick={() => {
                        useFloorStore.getState().updateTable(table.id, {
                          orientation: table.orientation === 'vertical' ? 'horizontal' : 'vertical'
                        });
                        setSelectedTableId(null);
                      }}
                      className="flex flex-col items-center justify-center p-3 rounded-lg border bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all"
                    >
                      <span className="text-xs font-bold flex items-center gap-2">🔄 Rotate</span>
                    </button>
                    <button
                      onClick={() => {
                        useFloorStore.getState().removeTable(table.id);
                        setSelectedTableId(null);
                      }}
                      className="flex flex-col items-center justify-center p-3 rounded-lg border bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/50 transition-all col-span-2"
                    >
                      <span className="text-xs font-bold flex items-center gap-2">🗑️ Delete Table</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
