import { create } from 'zustand';
import { TableElement, FloorPlan } from '@/types';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';

interface FloorStore {
  activeFloorPlan: FloorPlan | null;
  setActiveFloorPlan: (plan: FloorPlan) => void;
  updateTablePosition: (id: string, x: number, y: number) => void;
  updateTableStatus: (id: string, status: TableElement['currentStatus']) => void;
  addTable: (table: TableElement) => void;
  removeTable: (id: string) => void;
  updateTable: (id: string, updates: Partial<TableElement>) => void;
  selectedTableId: string | null;
  setSelectedTableId: (id: string | null) => void;
  isEditMode: boolean;
  setIsEditMode: (isEdit: boolean) => void;
  initializeFirebaseSync: (planId: string) => void;
}

// Helper to push state to Firestore
const syncToFirestore = async (plan: FloorPlan) => {
  if (!db) return;
  try {
    const docRef = doc(db, 'floorPlans', plan.id);
    // Strip undefined values which Firebase rejects
    const cleanPlan = JSON.parse(JSON.stringify(plan));
    await setDoc(docRef, cleanPlan);
  } catch (error) {
    console.error('Failed to sync floor plan to Firebase:', error);
  }
};

export const useFloorStore = create<FloorStore>((set) => ({
  activeFloorPlan: null,
  selectedTableId: null,
  isEditMode: false,
  setIsEditMode: (isEdit) => set({ isEditMode: isEdit }),
  setSelectedTableId: (id) => set({ selectedTableId: id }),
  setActiveFloorPlan: (plan) => {
    set({ activeFloorPlan: plan });
    syncToFirestore(plan);
  },
  initializeFirebaseSync: (planId) => set((state) => {
    if (!db) return state;
    
    const unsubscribe = onSnapshot(doc(db, 'floorPlans', planId), (snapshot) => {
      if (snapshot.exists()) {
        // Prevent recursive loop by checking if local state is older/different
        // In a full implementation, you'd merge or use server timestamps
        useFloorStore.setState({ activeFloorPlan: snapshot.data() as FloorPlan });
      }
    });

    // In a real app, store unsubscribe in state or useEffect cleanup
    return state;
  }),
  updateTablePosition: (id, x, y) => set((state) => {
    if (!state.activeFloorPlan) return state;
    const elements = state.activeFloorPlan.elements.map((el) => 
      el.id === id ? { ...el, position: { x, y } } : el
    );
    const newPlan = { ...state.activeFloorPlan, elements };
    syncToFirestore(newPlan);
    return { activeFloorPlan: newPlan };
  }),
  updateTableStatus: (id, status) => set((state) => {
    if (!state.activeFloorPlan) return state;
    const elements = state.activeFloorPlan.elements.map((el) => {
      if (el.id === id) {
        const clearsParty = status === 'available' || status === 'dirty';
        return { 
          ...el, 
          currentStatus: status,
          currentPartyName: clearsParty ? undefined : el.currentPartyName,
          currentPartyId: clearsParty ? undefined : el.currentPartyId,
          seatedAt: clearsParty ? undefined : el.seatedAt,
        };
      }
      return el;
    });
    const newPlan = { ...state.activeFloorPlan, elements };
    syncToFirestore(newPlan);
    return { activeFloorPlan: newPlan };
  }),
  addTable: (table) => set((state) => {
    if (!state.activeFloorPlan) return state;
    const newPlan = {
      ...state.activeFloorPlan,
      elements: [...state.activeFloorPlan.elements, table],
    };
    syncToFirestore(newPlan);
    return { activeFloorPlan: newPlan };
  }),
  removeTable: (id) => set((state) => {
    if (!state.activeFloorPlan) return state;
    const newPlan = {
      ...state.activeFloorPlan,
      elements: state.activeFloorPlan.elements.filter((el) => el.id !== id),
    };
    syncToFirestore(newPlan);
    return { activeFloorPlan: newPlan };
  }),
  updateTable: (id, updates) => set((state) => {
    if (!state.activeFloorPlan) return state;
    const elements = state.activeFloorPlan.elements.map((el) => 
      el.id === id ? { ...el, ...updates } : el
    );
    const newPlan = { ...state.activeFloorPlan, elements };
    syncToFirestore(newPlan);
    return { activeFloorPlan: newPlan };
  }),
}));
