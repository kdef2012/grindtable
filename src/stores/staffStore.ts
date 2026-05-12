import { create } from 'zustand';
import { StaffMember } from '@/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

interface StaffStore {
  staff: StaffMember[];
  isStaffSidebarOpen: boolean;
  setStaffSidebarOpen: (isOpen: boolean) => void;
  initializeStaffSync: () => void;
  addStaff: (member: StaffMember) => Promise<void>;
  updateStaff: (id: string, updates: Partial<StaffMember>) => Promise<void>;
  removeStaff: (id: string) => Promise<void>;
}

export const useStaffStore = create<StaffStore>((set) => ({
  staff: [],
  isStaffSidebarOpen: false,
  setStaffSidebarOpen: (isOpen) => set({ isStaffSidebarOpen: isOpen }),
  
  initializeStaffSync: () => set((state) => {
    if (!db) return state;
    
    const unsubscribe = onSnapshot(collection(db as any, 'staff'), (snapshot) => {
      const staffList = snapshot.docs.map(doc => doc.data() as StaffMember);
      // Pre-seed some dummy staff if empty to help testing
      if (staffList.length === 0) {
        const dummyStaff: StaffMember[] = [
          { id: 's1', name: 'Sarah', color: 'bg-rose-500', isActive: true },
          { id: 's2', name: 'Mike', color: 'bg-indigo-500', isActive: true },
          { id: 's3', name: 'Jenna', color: 'bg-teal-500', isActive: true },
        ];
        dummyStaff.forEach(s => setDoc(doc(db as any, 'staff', s.id), s));
      } else {
        useStaffStore.setState({ staff: staffList });
      }
    });

    return state;
  }),

  addStaff: async (member) => {
    if (!db) return;
    await setDoc(doc(db as any, 'staff', member.id), member);
  },

  updateStaff: async (id, updates) => {
    if (!db) return;
    const { staff } = useStaffStore.getState();
    const existing = staff.find(s => s.id === id);
    if (existing) {
      await setDoc(doc(db as any, 'staff', id), { ...existing, ...updates }, { merge: true });
    }
  },

  removeStaff: async (id) => {
    if (!db) return;
    await deleteDoc(doc(db as any, 'staff', id));
  }
}));
