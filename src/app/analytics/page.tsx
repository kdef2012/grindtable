'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, TrendingUp, Users, Clock, 
  UtensilsCrossed, Activity, CheckCircle, XCircle 
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function AnalyticsDashboard() {
  // Mock Data for the Dashboard
  const stats = {
    totalCovers: 248,
    avgTurnTime: 42,
    occupancyRate: 85,
    waitlistDrops: 12,
  };

  const serverWorkload = [
    { name: 'Sarah M.', tables: 5, guests: 18, avgTurnTime: '38m', color: 'bg-blue-500' },
    { name: 'John D.', tables: 4, guests: 12, avgTurnTime: '45m', color: 'bg-indigo-500' },
    { name: 'Emma T.', tables: 3, guests: 14, avgTurnTime: '41m', color: 'bg-purple-500' },
    { name: 'Michael R.', tables: 2, guests: 6, avgTurnTime: '52m', color: 'bg-pink-500' },
  ];

  const hourlyTraffic = [
    { hour: '4 PM', covers: 20, height: 'h-16' },
    { hour: '5 PM', covers: 45, height: 'h-32' },
    { hour: '6 PM', covers: 85, height: 'h-64' },
    { hour: '7 PM', covers: 110, height: 'h-80' },
    { hour: '8 PM', covers: 95, height: 'h-72' },
    { hour: '9 PM', covers: 40, height: 'h-24' },
  ];

  const { currentUser } = useAuthStore();
  const backRoute = currentUser?.role === 'manager' ? '/admin' : '/';

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-y-auto pb-12">
      {/* Header */}
      <header className="h-16 glass-dark border-b border-gray-800 flex items-center px-6 sticky top-0 z-10">
        <Link href={backRoute} className="mr-6 p-2 hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 text-white p-2 rounded-md">
            <Activity size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Manager Analytics <span className="text-gray-500 font-normal">| Live Insights</span></h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-dark border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Total Covers</p>
                <h3 className="text-4xl font-bold">{stats.totalCovers}</h3>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800"><Users className="text-green-500" size={24} /></div>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
              <TrendingUp size={16} /> +14% vs Last Friday
            </div>
          </div>

          <div className="glass-dark border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Avg Turn Time</p>
                <h3 className="text-4xl font-bold">{stats.avgTurnTime}<span className="text-xl text-gray-500 ml-1">min</span></h3>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800"><Clock className="text-amber-500" size={24} /></div>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-400 font-medium">
              <TrendingUp size={16} className="rotate-180" /> -3 mins vs Average
            </div>
          </div>

          <div className="glass-dark border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Live Occupancy</p>
                <h3 className="text-4xl font-bold">{stats.occupancyRate}<span className="text-xl text-gray-500 ml-1">%</span></h3>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800"><UtensilsCrossed className="text-blue-500" size={24} /></div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 mt-4">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${stats.occupancyRate}%` }}></div>
            </div>
          </div>

          <div className="glass-dark border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Waitlist Drop-off</p>
                <h3 className="text-4xl font-bold">{stats.waitlistDrops}</h3>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800"><XCircle className="text-red-500" size={24} /></div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
              Parties left before seating
            </div>
          </div>
        </div>

        {/* Charts & Details Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Server Workload */}
          <div className="glass-dark border border-gray-800 rounded-2xl p-6 shadow-xl col-span-1 lg:col-span-1">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Users className="text-indigo-400" size={20} /> Server Workload
            </h3>
            <div className="space-y-5">
              {serverWorkload.map((server) => (
                <div key={server.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">{server.name}</span>
                    <span className="text-xs font-bold text-amber-500 ml-auto mr-3">avg: {server.avgTurnTime}</span>
                    <span className="text-xs text-gray-400">{server.tables} tables ({server.guests} guests)</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-2 border border-gray-800">
                    <div className={`${server.color} h-2 rounded-full`} style={{ width: `${(server.tables / 6) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly Traffic Chart (CSS Based) */}
          <div className="glass-dark border border-gray-800 rounded-2xl p-6 shadow-xl col-span-1 lg:col-span-2">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="text-green-400" size={20} /> Hourly Traffic (Covers)
            </h3>
            
            <div className="h-64 flex items-end gap-2 sm:gap-6 mt-8 relative">
              {/* Y-Axis lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                <div className="w-full h-px bg-white"></div>
                <div className="w-full h-px bg-white"></div>
                <div className="w-full h-px bg-white"></div>
                <div className="w-full h-px bg-white"></div>
              </div>

              {hourlyTraffic.map((data, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer z-10">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-xs py-1 px-2 rounded mb-2 font-bold">
                    {data.covers}
                  </div>
                  <div className={`w-full max-w-[40px] bg-gradient-to-t from-indigo-900 to-indigo-500 rounded-t-sm ${data.height} transition-all duration-500 group-hover:from-indigo-600 group-hover:to-indigo-400`}></div>
                  <div className="text-xs text-gray-500 mt-3 font-medium">{data.hour}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
