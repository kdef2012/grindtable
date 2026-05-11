'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Search, Filter, Plus, Clock } from 'lucide-react';
import { useFloorStore } from '@/stores/floorStore';

// Mock Reservations
const RESERVATIONS = [
  { id: 'r1', name: 'Smith', guests: 4, tableId: 't1', startTime: '17:00', duration: 90, status: 'confirmed' },
  { id: 'r2', name: 'Johnson', guests: 2, tableId: 't3', startTime: '18:30', duration: 60, status: 'arrived' },
  { id: 'r3', name: 'Williams', guests: 6, tableId: 't4', startTime: '19:00', duration: 120, status: 'confirmed' },
  { id: 'r4', name: 'Brown VIP', guests: 5, tableId: 't5', startTime: '18:00', duration: 120, status: 'confirmed' },
];

const TIME_SLOTS = [
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', 
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
];

export default function ReservationsPage() {
  const { activeFloorPlan, setActiveFloorPlan } = useFloorStore();
  const tables = activeFloorPlan?.elements || [];

  React.useEffect(() => {
    if (!activeFloorPlan) {
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
        ],
      });
    }
  }, [activeFloorPlan, setActiveFloorPlan]);

  // Helper to convert time string to grid column index (0 to 11)
  const getColIndex = (time: string) => {
    return TIME_SLOTS.findIndex(slot => slot === time);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="h-16 glass-dark border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="mr-2 p-2 hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="bg-emerald-500 text-gray-950 p-2 rounded-md">
            <CalendarDays size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Reservations <span className="text-gray-500 font-normal">| Book</span></h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search reservations..." 
              className="bg-gray-900 border border-gray-800 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <button className="p-2 hover:bg-gray-800 rounded-full transition-colors"><Filter size={20} /></button>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-sm font-bold rounded-md transition-colors shadow-lg shadow-emerald-900/20">
            <Plus size={16} /> New Booking
          </button>
        </div>
      </header>

      {/* Main Content: Gantt Chart */}
      <main className="flex-1 overflow-auto p-6">
        <div className="glass-dark border border-gray-800 rounded-2xl overflow-hidden shadow-xl flex flex-col min-w-[800px]">
          
          {/* Timeline Header */}
          <div className="flex border-b border-gray-800 bg-gray-900/50 sticky top-0 z-20">
            <div className="w-48 p-4 font-bold text-gray-400 border-r border-gray-800 flex-shrink-0 flex items-center justify-between">
              <span>Tables</span>
              <Clock size={16} className="text-gray-600" />
            </div>
            <div className="flex-1 flex">
              {TIME_SLOTS.map((time) => (
                <div key={time} className="flex-1 p-3 text-center border-r border-gray-800/50 text-xs font-bold text-gray-500">
                  {time}
                </div>
              ))}
            </div>
          </div>

          {/* Grid Body */}
          <div className="flex-1 flex flex-col relative">
            {tables.map((table) => (
              <div key={table.id} className="flex border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors group">
                
                {/* Table Info Column */}
                <div className="w-48 p-4 border-r border-gray-800 flex-shrink-0 flex flex-col justify-center bg-gray-900/50 group-hover:bg-transparent">
                  <span className="font-bold text-sm">Table {table.number}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">{table.capacity} Seats • {table.type.replace('_top', '').replace('booth', 'Booth')}</span>
                </div>

                {/* Timeline Slots for this Table */}
                <div className="flex-1 relative flex">
                  {/* Background Grid Lines */}
                  {TIME_SLOTS.map((time, idx) => (
                    <div key={`grid-${idx}`} className="flex-1 border-r border-gray-800/20 h-16"></div>
                  ))}

                  {/* Render Reservations for this Table */}
                  {RESERVATIONS.filter(r => r.tableId === table.id).map((res) => {
                    const colIndex = getColIndex(res.startTime);
                    if (colIndex === -1) return null;
                    
                    const slotWidthPercentage = 100 / TIME_SLOTS.length;
                    const leftOffset = colIndex * slotWidthPercentage;
                    // Duration is in minutes. Each slot is 30 mins.
                    const widthPercentage = (res.duration / 30) * slotWidthPercentage;

                    return (
                      <div 
                        key={res.id}
                        className="absolute top-2 bottom-2 rounded-md shadow-lg flex flex-col justify-center px-3 cursor-pointer overflow-hidden group/res"
                        style={{
                          left: `${leftOffset}%`,
                          width: `${widthPercentage}%`,
                          backgroundColor: res.status === 'arrived' ? '#059669' : '#0f766e', // Emeralds and Teals
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        <div className="absolute inset-0 bg-white/0 group-hover/res:bg-white/10 transition-colors"></div>
                        <span className="font-bold text-sm truncate text-white">{res.name}</span>
                        <span className="text-xs text-emerald-100 truncate opacity-80">{res.guests} Guests</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Current Time Indicator Line (Mocked to 18:15) */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10 shadow-[0_0_8px_rgba(245,158,11,0.5)] pointer-events-none" style={{ left: 'calc(192px + ((4.5 / 12) * calc(100% - 192px)))' }}>
              <div className="absolute -top-3 -translate-x-1/2 bg-amber-500 text-gray-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Live
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
