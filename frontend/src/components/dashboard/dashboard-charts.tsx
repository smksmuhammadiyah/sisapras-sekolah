"use client"

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const CONDITION_COLORS = {
  'GOOD': '#22c55e', // green-500
  'BROKEN_LIGHT': '#eab308', // yellow-500
  'BROKEN_HEAVY': '#ef4444' // red-500
};

interface DashboardStats {
  totalAssets: number;
  assetConditions: { name: string; value: number }[];
  lowStockItems: { name: string; quantity: number; limit: number }[];
  procurementStats: { name: string; value: number }[];
}

export function DashboardCharts() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
        toast.error("Gagal memuat data analitik");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  if (!stats) return null;

  // Transform Condition Data for Colors
  const assetData = stats.assetConditions.map(item => ({
    ...item,
    color: CONDITION_COLORS[item.name as keyof typeof CONDITION_COLORS] || '#8884d8'
  }));

  const procurementData = stats.procurementStats.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Asset Condition Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Kondisi Aset</CardTitle>
          <CardDescription>Distribusi kondisi aset keseluruhan</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={assetData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }: { name: string; percent?: number }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
              >
                {assetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Procurement Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Status Pengadaan</CardTitle>
          <CardDescription>Overview status usulan pengadaan</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={procurementData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {procurementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Low Stock Bar Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Stok Menipis (Top 5)</CardTitle>
          <CardDescription>Item dengan stok paling sedikit</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.lowStockItems}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" name="Stok Saat Ini" fill="#ef4444" radius={[0, 4, 4, 0]} />
              <Bar dataKey="limit" name="Batas Minimum" fill="#e5e7eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
