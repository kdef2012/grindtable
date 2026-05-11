'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore, User, Role } from '@/stores/authStore';
import { 
  ArrowLeft, Users, ShieldAlert, Key, 
  Trash2, Plus, LayoutDashboard, Activity, CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { currentUser, users, addUser, removeUser, logout } = useAuthStore();
  const router = useRouter();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newRole, setNewRole] = useState<Role>('host');

  // Protect route
  if (currentUser?.role !== 'manager') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <ShieldAlert size={64} className="text-red-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-6">You must be a manager to view this page.</p>
        <Link href="/" className="px-6 py-2 bg-gray-800 rounded-lg font-bold">Return Home</Link>
      </div>
    );
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPin || newPin.length !== 4) return;
    
    addUser({
      id: `u_${Math.random().toString(36).substr(2, 9)}`,
      name: newName,
      pin: newPin,
      role: newRole
    });

    setNewName('');
    setNewPin('');
    setIsAddOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-12">
      {/* Header */}
      <header className="h-16 glass-dark border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-red-500 text-white p-2 rounded-md">
            <ShieldAlert size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Admin Console <span className="text-gray-500 font-normal">| Manager</span></h1>
        </div>
        <button onClick={handleLogout} className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold transition-colors">
          Lock System
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/" className="glass-panel p-6 rounded-2xl border border-gray-800 shadow-xl flex items-center justify-between group hover:border-amber-500/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500/10 p-4 rounded-xl text-amber-500 group-hover:scale-110 transition-transform"><LayoutDashboard size={32} /></div>
              <div>
                <h3 className="font-bold text-xl">Host Stand</h3>
                <p className="text-gray-400 text-sm">Access the live floor plan & waitlist</p>
              </div>
            </div>
            <ArrowLeft className="rotate-180 text-gray-600 group-hover:text-amber-500 transition-colors" />
          </Link>

          <Link href="/analytics" className="glass-panel p-6 rounded-2xl border border-gray-800 shadow-xl flex items-center justify-between group hover:border-indigo-500/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-500/10 p-4 rounded-xl text-indigo-500 group-hover:scale-110 transition-transform"><Activity size={32} /></div>
              <div>
                <h3 className="font-bold text-xl">Analytics Dashboard</h3>
                <p className="text-gray-400 text-sm">View live KPI metrics & heatmaps</p>
              </div>
            </div>
            <ArrowLeft className="rotate-180 text-gray-600 group-hover:text-indigo-500 transition-colors" />
          </Link>
        </div>

        {/* User Management */}
        <div className="glass-dark border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
            <h2 className="text-xl font-bold flex items-center gap-2"><Users className="text-emerald-500" /> Host Directory & PINs</h2>
            <button 
              onClick={() => setIsAddOpen(!isAddOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors text-sm"
            >
              <Plus size={16} /> New Host
            </button>
          </div>

          {/* Add User Form */}
          {isAddOpen && (
            <form onSubmit={handleAddUser} className="p-6 bg-gray-900 border-b border-gray-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Host Name</label>
                <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Sarah M." className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">4-Digit PIN</label>
                <input required type="text" maxLength={4} pattern="\d{4}" value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="e.g. 1234" className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Role</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value as Role)} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none">
                  <option value="host">Host</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-emerald-500 text-gray-950 font-bold py-2 rounded-lg hover:bg-emerald-400 transition-colors">
                Save User
              </button>
            </form>
          )}

          {/* User List */}
          <div className="divide-y divide-gray-800/50">
            {users.map(user => (
              <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-800/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${user.role === 'manager' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold">{user.name}</h4>
                    <span className="text-xs text-gray-500 uppercase tracking-widest">{user.role}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-gray-400 font-mono bg-gray-900 px-3 py-1 rounded-md border border-gray-800">
                    <Key size={14} /> • • • • (Hidden)
                  </div>
                  {user.id !== 'u_admin' && (
                    <button 
                      onClick={() => removeUser(user.id)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
