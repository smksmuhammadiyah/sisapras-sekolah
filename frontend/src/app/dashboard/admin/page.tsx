"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ClipboardList, AlertTriangle, Hammer, Loader2 } from 'lucide-react';
import { QuickStart } from '@/components/dashboard/QuickStart';
import { HealthStatusWidget } from '@/components/dashboard/health-status';
import { RoleGuard } from '@/components/auth/role-guard';
import dynamic from 'next/dynamic';

const DashboardCharts = dynamic(() => import('@/components/dashboard/dashboard-charts').then(mod => mod.DashboardCharts), {
  loading: () => <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>,
  ssr: false
});

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    assets: 0,
    rooms: 0,
    audits: 0,
    services: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/summary');
        setStats(res.data);
      } catch (e) {
        console.error("Failed to fetch stats");
      }
    };
    fetchStats();
  }, []);

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="space-y-12">
        <h1 className="text-3xl font-bold">Beranda Wakasek Sarpras</h1>

        <QuickStart role="ADMIN" />

        <div className="mb-6">
          <HealthStatusWidget />
        </div>

        <div className="pt-4">
          <DashboardCharts />
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Aset</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ruangan</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rooms}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audit Selesai</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.audits}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Riwayat Perbaikan</CardTitle>
              <Hammer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.services}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
