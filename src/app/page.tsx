'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useFloorStore } from '@/stores/floorStore';
import { FloorCanvas } from '@/components/floor/FloorCanvas';
import { Settings, Users, LayoutDashboard, UtensilsCrossed, Clock, Edit3, Sparkles, Plus, ArrowLeft } from 'lucide-react';
import { TableElement } from '@/types';
import { useWaitlistStore } from '@/stores/waitlistStore';
import { AddGuestModal } from '@/components/modals/AddGuestModal';
import { TableDetailsModal } from '@/components/modals/TableDetailsModal';
import { AddTableModal } from '@/components/modals/AddTableModal';
import { WaitlistGuest } from '@/components/waitlist/WaitlistGuest';
import { useAuthStore } from '@/stores/authStore';

const INITIAL_TABLES: TableElement[] = [
  { id: 't1', number: '11', capacity: 4, type: '4_top', shape: 'square', zone: 'main', position: { x: 100, y: 100 }, currentStatus: 'available' },
  { id: 't2', number: '12', capacity: 4, type: '4_top', shape: 'square', zone: 'main', position: { x: 300, y: 100 }, currentStatus: 'occupied', seatedAt: Date.now() - 1000 * 60 * 30 },
  { id: 't3', number: '13', capacity: 2, type: '2_top', shape: 'round', zone: 'main', position: { x: 500, y: 120 }, currentStatus: 'dirty' },
  { id: 't4', number: 'B1', capacity: 6, type: 'booth', shape: 'rectangle', zone: 'booths', position: { x: 100, y: 300 }, currentStatus: 'reserved' },
  { id: 't5', number: 'B2', capacity: 6, type: 'booth', shape: 'rectangle', zone: 'booths', position: { x: 300, y: 300 }, currentStatus: 'available' },
  { id: 't6', number: '21', capacity: 8, type: '8_top', shape: 'round', zone: 'private', position: { x: 700, y: 200 }, currentStatus: 'check_dropped' },
];

export default function HostStandPage() {
  const { setActiveFloorPlan, activeFloorPlan, isEditMode, setIsEditMode, updateTablePosition, updateTableStatus, updateTable } = useFloorStore();
  const { entries: waitlistEntries, setAddGuestModalOpen, updateEntryStatus } = useWaitlistStore();
  const { currentUser } = useAuthStore();
  const [activeDragData, setActiveDragData] = useState<any>(null);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);

  const availableCount = activeFloorPlan?.elements.filter(t => t.currentStatus === 'available').length || 0;
  const occupiedCount = activeFloorPlan?.elements.filter(t => t.currentStatus === 'occupied' || t.currentStatus === 'ordering' || t.currentStatus === 'check_dropped').length || 0;
  const waitlistCount = waitlistEntries.filter(e => e.status === 'waiting' || e.status === 'notified').length;

  useEffect(() => {
    // Initialize with fake data
    setActiveFloorPlan({
      id: 'plan_1',
      name: 'Main Dining Floor',
      isActive: true,
      createdAt: Date.now(),
      elements: INITIAL_TABLES,
    });
    // Start syncing with Firebase
    useFloorStore.getState().initializeFirebaseSync('plan_1');
  }, [setActiveFloorPlan]);

  // Dynamic Quote Time
  const dynamicQuoteTime = Math.max(10, occupiedCount * 3 + waitlistCount * 5);

  // Auto-cull abandoned
  useEffect(() => {
    const interval = setInterval(() => {
      useWaitlistStore.getState().cullAbandonedEntries();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSmartSeat = () => {
    const topWaiting = waitlistEntries.find(e => e.status === 'waiting' || e.status === 'notified');
    if (!topWaiting) return;
    
    const optimalTable = activeFloorPlan?.elements.find(t => 
      t.currentStatus === 'available' && t.capacity >= topWaiting.partySize && (t.capacity - topWaiting.partySize <= 2)
    );
    
    if (optimalTable) {
      updateTable(optimalTable.id, {
        currentStatus: 'occupied',
        currentPartyName: topWaiting.name,
        currentPartyId: topWaiting.id,
        seatedAt: Date.now()
      });
      updateEntryStatus(topWaiting.id, 'seated');
    } else {
      alert("No optimal table currently available for the top waitlist party.");
    }
  };

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragData(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragData(null);
    const { active, over, delta } = event;
    
    // Handle Table dragging (Edit Mode)
    if (active.data.current?.type === 'table') {
      const tableId = active.id as string;
      const table = activeFloorPlan?.elements.find((el) => el.id === tableId);
      if (table && delta) {
        const snapToGrid = (value: number) => Math.round(value / 20) * 20;
        const newX = table.position.x + delta.x;
        const newY = table.position.y + delta.y;
        updateTablePosition(
          tableId, 
          isEditMode ? snapToGrid(newX) : newX, 
          isEditMode ? snapToGrid(newY) : newY
        );
      }
    }
    
    // Handle Waitlist Guest Dropped onto Table
    if (active.data.current?.type === 'waitlist_guest' && over?.data.current?.type === 'table') {
      const entryId = active.data.current.entry.id;
      const entryName = active.data.current.entry.name;
      const tableId = over.id as string;
      
      updateTable(tableId, { 
        currentStatus: 'occupied',
        currentPartyName: entryName,
        currentPartyId: entryId,
        seatedAt: Date.now()
      });
      updateEntryStatus(entryId, 'seated');
    }
  };

  const handleDragCancel = () => {
    setActiveDragData(null);
  };

  return (
    <DndContext id="dnd-context" sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
      <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 glass-dark border-b border-gray-800 flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-3">
          {currentUser?.role === 'manager' && (
            <Link href="/admin" className="mr-2 p-2 hover:bg-gray-800 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
          )}
          <div className="bg-amber-500 text-gray-950 p-2 rounded-md">
            <UtensilsCrossed size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">GrindTable <span className="text-gray-500 font-normal">| Host Stand</span></h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-4 text-sm font-medium mr-4">
            <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-md border border-gray-800">
              <Clock size={16} className="text-amber-500" /> Wait: ~{dynamicQuoteTime}m
            </div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Avail: {availableCount}</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Occ: {occupiedCount}</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Wait: {waitlistCount}</div>
          </div>
          <button 
            onClick={handleSmartSeat}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-md transition-colors shadow-lg shadow-indigo-900/20"
          >
            <Sparkles size={16} /> Smart Seat
          </button>
          <div className="w-px h-8 bg-gray-800 mx-1"></div>
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`p-2 rounded-full transition-colors ${isEditMode ? 'bg-amber-500 text-gray-950' : 'hover:bg-gray-800'}`}
            title="Edit Floor Plan"
          >
            <Edit3 size={20} />
          </button>
          <div className="w-px h-8 bg-gray-800 mx-2"></div>
          {isEditMode ? (
            <button 
              onClick={() => setIsAddTableOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-bold rounded-md transition-colors shadow-lg"
            >
              <Plus size={16} /> Add Table
            </button>
          ) : (
            <>
              <Link href="/reservations" className="p-2 hover:bg-gray-800 rounded-full transition-colors inline-flex items-center justify-center">
                <Users size={20} />
              </Link>
              <Link href="/analytics" className="p-2 hover:bg-gray-800 rounded-full transition-colors inline-flex items-center justify-center">
                <LayoutDashboard size={20} />
              </Link>
            </>
          )}
          <button className="p-2 hover:bg-gray-800 rounded-full transition-colors"><Settings size={20} /></button>
          
          <div className="w-px h-8 bg-gray-800 mx-1"></div>
          <button 
            onClick={() => {
              useAuthStore.getState().logout();
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 hover:bg-red-500 hover:text-white border border-gray-800 rounded-md text-sm font-bold transition-all text-gray-400"
          >
            Lock
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Waitlist */}
        <aside className="w-80 glass-panel border-r border-gray-800/50 flex flex-col z-10 shrink-0">
          <div className="p-4 border-b border-gray-800/50">
            <h2 className="font-bold text-lg mb-2">Waitlist</h2>
            <button 
              onClick={() => setAddGuestModalOpen(true)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-2 rounded-md transition-colors"
            >
              + Add Guest
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {waitlistEntries.filter(e => e.status !== 'seated' && e.status !== 'cancelled').map((entry) => (
              <WaitlistGuest key={entry.id} entry={entry} />
            ))}
            {waitlistEntries.length === 0 && (
              <div className="text-center text-gray-500 mt-8 text-sm">List is empty</div>
            )}
          </div>
        </aside>

        {/* Center: Floor Plan Canvas */}
        <main className="flex-1 bg-gray-900 relative overflow-hidden">
          <FloorCanvas isEditMode={isEditMode} />
          
          {/* Legend Overlay */}
          <div className="absolute bottom-6 left-6 glass-dark p-4 rounded-lg flex gap-4 text-xs font-medium border border-gray-800 shadow-xl">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Available</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Occupied</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Reserved</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-800 border border-gray-600"></div> Dirty</div>
          </div>
        </main>
      </div>

      <AddGuestModal />
      <TableDetailsModal />
      <AddTableModal isOpen={isAddTableOpen} onClose={() => setIsAddTableOpen(false)} />

      <DragOverlay dropAnimation={null}>
        {activeDragData?.type === 'waitlist_guest' ? (
          <div className="bg-gray-900 border border-amber-500 shadow-2xl rounded-lg p-3 w-72 opacity-95 flex items-center gap-3">
            <Users size={20} className="text-gray-400" />
            <div>
              <div className="font-bold">{activeDragData.entry.name} Party</div>
              <div className="text-sm text-gray-400">{activeDragData.entry.partySize} people</div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </div>
    </DndContext>
  );
}
