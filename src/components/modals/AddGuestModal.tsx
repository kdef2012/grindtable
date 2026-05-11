'use client';

import React, { useState } from 'react';
import { useWaitlistStore } from '@/stores/waitlistStore';
import { X } from 'lucide-react';

export function AddGuestModal() {
  const { isAddGuestModalOpen, setAddGuestModalOpen, addEntry } = useWaitlistStore();
  const [name, setName] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [quotedTime, setQuotedTime] = useState(15);
  const [notes, setNotes] = useState('');

  if (!isAddGuestModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addEntry({ name, partySize, quotedTime, notes });
    setAddGuestModalOpen(false);
    // Reset form
    setName('');
    setPartySize(2);
    setQuotedTime(15);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-dark w-full max-w-md rounded-xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <h2 className="text-xl font-bold">Add to Waitlist</h2>
          <button 
            onClick={() => setAddGuestModalOpen(false)}
            className="rounded-full p-1 hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Guest Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="e.g. John Doe"
              required
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-1">Party Size</label>
              <input 
                type="number" 
                min="1"
                max="20"
                value={partySize}
                onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-1">Quoted Wait (min)</label>
              <select 
                value={quotedTime}
                onChange={(e) => setQuotedTime(parseInt(e.target.value))}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              >
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
                <option value={20}>20 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes (Optional)</label>
            <input 
              type="text" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="e.g. High chair, Booth preference"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => setAddGuestModalOpen(false)}
              className="px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-gray-950 px-6 py-2 rounded-lg font-bold transition-colors"
            >
              Add to List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
