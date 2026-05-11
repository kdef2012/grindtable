'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { UtensilsCrossed, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function LockScreen({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login, currentUser } = useAuthStore();
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  // Double tap logic
  const [lastTap, setLastTap] = useState(0);
  
  const handleLogoTap = () => {
    const now = Date.now();
    if (now - lastTap < 500) {
      // Double tapped
      setShowPin(true);
    }
    setLastTap(now);
  };

  const handlePinEntry = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        const success = login(newPin);
        if (success) {
          const user = useAuthStore.getState().currentUser;
          // Route based on role
          if (user?.role === 'manager') {
            router.push('/admin');
          } else {
            router.push('/');
          }
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950 text-white overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(245,158,11,0.05),_transparent_50%)] pointer-events-none"></div>
      
      <div className="flex flex-col items-center z-10 animate-in fade-in zoom-in duration-500">
        
        {/* Logo - Double Tap Target */}
        <div 
          onClick={handleLogoTap}
          className="cursor-pointer flex flex-col items-center gap-4 select-none hover:scale-105 transition-transform active:scale-95"
        >
          <div className="bg-amber-500 text-gray-950 p-6 rounded-2xl shadow-2xl shadow-amber-500/20">
            <UtensilsCrossed size={64} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">GrindTable</h1>
          {!showPin && <p className="text-gray-500 text-sm opacity-50 tracking-widest uppercase">System Locked</p>}
        </div>

        {/* PIN Pad */}
        <div className={`mt-12 transition-all duration-500 ${showPin ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
          <div className="glass-panel p-8 rounded-3xl border border-gray-800 shadow-2xl flex flex-col items-center">
            <div className="flex items-center gap-2 mb-6">
              <Lock size={16} className={error ? 'text-red-500' : 'text-gray-400'} />
              <span className={`text-sm font-bold tracking-widest ${error ? 'text-red-500' : 'text-gray-400'}`}>
                {error ? 'ACCESS DENIED' : 'ENTER PIN'}
              </span>
            </div>

            {/* PIN Dots */}
            <div className="flex gap-4 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    i < pin.length 
                      ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' 
                      : 'bg-gray-800'
                  }`}
                />
              ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePinEntry(num.toString())}
                  className="w-16 h-16 rounded-full bg-gray-900 border border-gray-800 text-xl font-bold hover:bg-gray-800 hover:border-gray-700 active:scale-95 transition-all flex items-center justify-center"
                >
                  {num}
                </button>
              ))}
              <div className="col-start-2">
                <button
                  onClick={() => handlePinEntry('0')}
                  className="w-16 h-16 rounded-full bg-gray-900 border border-gray-800 text-xl font-bold hover:bg-gray-800 hover:border-gray-700 active:scale-95 transition-all flex items-center justify-center"
                >
                  0
                </button>
              </div>
              <div className="col-start-3 flex items-center justify-center">
                <button
                  onClick={handleDelete}
                  className="text-gray-500 hover:text-white font-bold text-sm tracking-widest uppercase active:scale-95 transition-all"
                >
                  DEL
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
