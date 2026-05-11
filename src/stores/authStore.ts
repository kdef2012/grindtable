import { create } from 'zustand';

export type Role = 'manager' | 'host';

export interface User {
  id: string;
  name: string;
  pin: string;
  role: Role;
}

interface AuthStore {
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  login: (pin: string) => boolean;
  logout: () => void;
  addUser: (user: User) => void;
  removeUser: (id: string) => void;
  updateUser: (id: string, user: Partial<User>) => void;
}

const DEFAULT_USERS: User[] = [
  { id: 'u_admin', name: 'General Manager', pin: '2010', role: 'manager' },
  { id: 'u_host1', name: 'Test Host', pin: '2020', role: 'host' }
];

export const useAuthStore = create<AuthStore>((set, get) => ({
  isAuthenticated: false,
  currentUser: null,
  users: DEFAULT_USERS,
  
  login: (pin: string) => {
    const user = get().users.find(u => u.pin === pin);
    if (user) {
      set({ isAuthenticated: true, currentUser: user });
      return true;
    }
    return false;
  },
  
  logout: () => set({ isAuthenticated: false, currentUser: null }),
  
  addUser: (user) => set(state => ({ users: [...state.users, user] })),
  
  removeUser: (id) => set(state => ({ 
    users: state.users.filter(u => u.id !== id) 
  })),
  
  updateUser: (id, updates) => set(state => ({
    users: state.users.map(u => u.id === id ? { ...u, ...updates } : u)
  }))
}));
