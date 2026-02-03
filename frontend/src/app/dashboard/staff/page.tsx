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
    // In real app, use specific endpoints
    const fetchStats = async () => {
      try {
        // Mock logic for demo
        const pendingAudits = 5;
        const brokenAssets = 12;
        const upcomingServices = 3;
        setStats({ pendingAudits, brokenAssets, upcomingServices });
      } catch (e) {
        console.error("Failed to fetch stats");
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Beranda Petugas Sarpras</h1>

      <QuickStart role="STAFF" />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Menunggu</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAudits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aset Rusak</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.brokenAssets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jadwal Perbaikan</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingServices}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
