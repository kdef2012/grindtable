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
  selectedTableIds: string[];
  toggleTableSelection: (id: string) => void;
  clearSelection: () => void;
  isMultiSelectMode: boolean;
  setIsMultiSelectMode: (v: boolean) => void;
  dragDelta: {x: number, y: number} | null;
  setDragDelta: (delta: {x: number, y: number} | null) => void;
  isEditMode: boolean;
  setIsEditMode: (isEdit: boolean) => void;
  initializeFirebaseSync: (planId: string) => void;
}

// Helper to push state to Firestore
const syncToFirestore = async (plan: FloorPlan) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`floorPlan_${plan.id}`, JSON.stringify(plan));
  }
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
  selectedTableIds: [],
  isMultiSelectMode: false,
  dragDelta: null,
  isEditMode: false,
  setIsEditMode: (isEdit) => set({ isEditMode: isEdit, selectedTableIds: isEdit ? [] : [], isMultiSelectMode: false }),
  setSelectedTableId: (id) => set({ selectedTableId: id }),
  setIsMultiSelectMode: (v) => set({ isMultiSelectMode: v, selectedTableIds: [] }),
  setDragDelta: (d) => set({ dragDelta: d }),
  toggleTableSelection: (id) => set((state) => ({
    selectedTableIds: state.selectedTableIds.includes(id) 
      ? state.selectedTableIds.filter(i => i !== id) 
      : [...state.selectedTableIds, id]
  })),
  clearSelection: () => set({ selectedTableIds: [] }),
  setActiveFloorPlan: (plan) => {
    set({ activeFloorPlan: plan });
    syncToFirestore(plan);
  },
  initializeFirebaseSync: (planId) => set((state) => {
    // 1. Immediately try loading from local storage so UI is instantaneous and survives refresh
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`floorPlan_${planId}`);
      if (cached) {
        useFloorStore.setState({ activeFloorPlan: JSON.parse(cached) });
      }
    }

    if (!db) return state;
    
    const unsubscribe = onSnapshot(doc(db, 'floorPlans', planId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as FloorPlan;
        const currentLocalPlan = useFloorStore.getState().activeFloorPlan;
        
        // CRITICAL SAFEGUARD: Do not let Firebase wipe out our local plan if Firebase is empty and local is full.
        // This prevents the screen from going blank if Firebase failed to sync the full layout earlier.
        if (data.elements.length === 0 && currentLocalPlan && currentLocalPlan.elements.length > 0) {
          console.warn("Firebase returned an empty plan, but local has tables. Pushing local to Firebase to fix.");
          syncToFirestore(currentLocalPlan);
          return;
        }

        useFloorStore.setState({ activeFloorPlan: data });
        if (typeof window !== 'undefined') {
          localStorage.setItem(`floorPlan_${planId}`, JSON.stringify(data));
        }
      } else {
        // If it doesn't exist in Firebase, AND we don't have a cached version, create an empty one
        if (!useFloorStore.getState().activeFloorPlan) {
          const emptyPlan: FloorPlan = {
            id: planId,
            name: 'Main Dining Floor',
            isActive: true,
            createdAt: Date.now(),
            elements: []
          };
          useFloorStore.getState().setActiveFloorPlan(emptyPlan);
        } else {
          // We have a local cached plan but firebase has nothing (maybe wiped). 
          // Let's push our cached plan up to Firebase to restore it!
          const currentPlan = useFloorStore.getState().activeFloorPlan;
          if (currentPlan) syncToFirestore(currentPlan);
        }
      }
    });

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
