"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck, AlertCircle, Calendar } from 'lucide-react';
import { QuickStart } from '@/components/dashboard/QuickStart';

export default function StaffDashboard() {
  const [stats, setStats] = useState({
    pendingAudits: 0,
    brokenAssets: 0,
    upcomingServices: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/staff-summary');
        setStats(res.data);
      } catch (e) {
        console.error("Failed to fetch stats");
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2 px-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-heading">Beranda Petugas Sarpras</h1>
        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Selamat datang kembali. Berikut ringkasan tugas hari ini.</p>
      </div>

      <QuickStart role="STAFF" />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 px-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Audit Menunggu</CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <ClipboardCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.pendingAudits}</div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Perlu verifikasi fisik segera</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 px-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Aset Rusak</CardTitle>
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-500">{stats.brokenAssets}</div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Beban kerja perbaikan aktif</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 px-1 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Jadwal Perbaikan</CardTitle>
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.upcomingServices}</div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Diagendakan minggu ini</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
