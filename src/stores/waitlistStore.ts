import { create } from 'zustand';

export interface WaitlistEntry {
  id: string;
  name: string;
  partySize: number;
  quotedTime: number; // in minutes
  createdAt: number;
  status: 'waiting' | 'notified' | 'seated' | 'cancelled';
  notes?: string;
  isVIP?: boolean;
  visitCount?: number;
  hasPreOrder?: boolean;
  notifiedAt?: number;
}

interface WaitlistStore {
  entries: WaitlistEntry[];
  isAddGuestModalOpen: boolean;
  setAddGuestModalOpen: (isOpen: boolean) => void;
  addEntry: (entry: Omit<WaitlistEntry, 'id' | 'createdAt' | 'status'>) => void;
  updateEntryStatus: (id: string, status: WaitlistEntry['status']) => void;
  removeEntry: (id: string) => void;
  notifyGuest: (id: string) => void;
  cullAbandonedEntries: () => void;
}

export const useWaitlistStore = create<WaitlistStore>((set) => ({
  entries: [
    { id: 'w1', name: 'Smith', partySize: 4, quotedTime: 15, createdAt: Date.now() - 1000 * 60 * 5, status: 'waiting', isVIP: true, visitCount: 12 },
    { id: 'w2', name: 'Johnson', partySize: 2, quotedTime: 25, createdAt: Date.now() - 1000 * 60 * 10, status: 'notified', notifiedAt: Date.now() - 1000 * 60 * 3, hasPreOrder: true },
    { id: 'w3', name: 'Williams', partySize: 6, quotedTime: 45, createdAt: Date.now() - 1000 * 60 * 2, status: 'waiting' },
  ],
  isAddGuestModalOpen: false,
  setAddGuestModalOpen: (isOpen) => set({ isAddGuestModalOpen: isOpen }),
  addEntry: (entry) => set((state) => ({
    entries: [
      ...state.entries,
      {
        ...entry,
        id: `w_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        status: 'waiting',
      }
    ]
  })),
  updateEntryStatus: (id, status) => set((state) => ({
    entries: state.entries.map((e) => (e.id === id ? { ...e, status } : e)),
  })),
  removeEntry: (id) => set((state) => ({
    entries: state.entries.filter((e) => e.id !== id),
  })),
  notifyGuest: (id) => set((state) => ({
    entries: state.entries.map((e) => (e.id === id ? { ...e, status: 'notified', notifiedAt: Date.now() } : e)),
  })),
  cullAbandonedEntries: () => set((state) => {
    const tenMinutes = 10 * 60 * 1000;
    const now = Date.now();
    return {
      entries: state.entries.map((e) => {
        if (e.status === 'notified' && e.notifiedAt && (now - e.notifiedAt > tenMinutes)) {
          return { ...e, status: 'cancelled' };
        }
        return e;
      })
    };
  }),
}));
