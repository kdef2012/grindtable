'use client';

import React, { useState } from 'react';
import { useWaitlistStore } from '@/stores/waitlistStore';
import { UtensilsCrossed, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function GuestJoinPage() {
  const { addEntry } = useWaitlistStore();
  const [formData, setFormData] = useState({ name: '', partySize: 2, notes: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEntry({
      name: formData.name,
      partySize: formData.partySize,
      quotedTime: formData.partySize > 4 ? 45 : 25,
      notes: formData.notes,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <CheckCircle size={64} className="text-green-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">You're on the list!</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          We've added you to the waitlist. You will receive an SMS when your table is ready.
        </p>
        <Link href="/" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold transition-colors">
          Return to GrindTable
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-white">
      <div className="w-full max-w-md glass-dark border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-amber-500 text-gray-950 p-4 rounded-xl">
            <UtensilsCrossed size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Join the Waitlist</h1>
        <p className="text-gray-400 text-center text-sm mb-8">Skip the line and join directly from your phone.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
            <input 
              required
              type="text" 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              placeholder="e.g. Smith"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Party Size</label>
            <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
              <button 
                type="button"
                className="px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white"
                onClick={() => setFormData(p => ({ ...p, partySize: Math.max(1, p.partySize - 1) }))}
              >-</button>
              <div className="flex-1 text-center font-bold">{formData.partySize}</div>
              <button 
                type="button"
                className="px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white"
                onClick={() => setFormData(p => ({ ...p, partySize: Math.min(20, p.partySize + 1) }))}
              >+</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Special Requests (Optional)</label>
            <textarea 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors h-24 resize-none"
              placeholder="e.g. Highchair needed, allergic to nuts"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-lg py-4 rounded-xl transition-colors mt-4 shadow-lg shadow-amber-500/20"
          >
            Check In
          </button>
        </form>
      </div>
    </div>
  );
}
