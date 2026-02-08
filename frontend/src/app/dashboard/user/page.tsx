"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, FileText, CheckCircle } from 'lucide-react';
import { QuickStart } from '@/components/dashboard/QuickStart';

import api from '@/lib/api';

export default function UserDashboard() {
  const [stats, setStats] = useState({
    myProposals: 0,
    approvedProposals: 0,
    itemsInStock: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/user-summary');
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2 px-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-heading">Beranda Guru / Kaprog</h1>
        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Kelola pengadaan barang dan pantau stok inventaris sekolah.</p>
      </div>

      <QuickStart role="USER" />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 px-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Usulan Saya</CardTitle>
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.myProposals}</div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Total pengajuan pengadaan</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 px-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Disetujui</CardTitle>
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-500">{stats.approvedProposals}</div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Usulan yang telah diverifikasi</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 px-1 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Stok Barang</CardTitle>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.itemsInStock}</div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Item tersedia di gudang</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
