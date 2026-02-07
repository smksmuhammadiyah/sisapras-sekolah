"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { SearchInput } from '@/components/ui/search-input';
import { ServiceReportButton } from '@/components/reports/service-report-button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Eye, Wrench, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function ServiceListPage() {
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/services').then(res => {
      setServices(res.data);
      setFilteredServices(res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredServices(services);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredServices(services.filter(s =>
        (s.asset?.name || '').toLowerCase().includes(lower) ||
        s.type.toLowerCase().includes(lower) ||
        (s.technician || '').toLowerCase().includes(lower)
      ));
    }
  }, [searchTerm, services]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'Selesai', color: 'bg-green-500', icon: <CheckCircle2 className="w-4 h-4" />, progress: 100 };
      case 'IN_PROGRESS':
        return { label: 'Proses', color: 'bg-blue-500', icon: <Clock className="w-4 h-4 animate-spin-slow" />, progress: 65 };
      case 'PENDING':
        return { label: 'Menunggu', color: 'bg-yellow-500', icon: <AlertCircle className="w-4 h-4" />, progress: 15 };
      default:
        return { label: 'Selesai', color: 'bg-green-500', icon: <CheckCircle2 className="w-4 h-4" />, progress: 100 };
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 font-sans">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-slate-900 dark:text-slate-100 font-heading truncate">Riwayat Servis</h1>
          <p className="text-slate-500 mt-1 text-sm leading-relaxed max-w-2xl">Log pemeliharaan dan perbaikan aset.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
          <SearchInput onSearch={setSearchTerm} className="w-full sm:w-72 h-9 rounded-lg shadow-sm" placeholder="Cari servis..." />
          <div className="flex items-center gap-2 shrink-0">
            <ServiceReportButton />
            <Button asChild size="sm" className="w-full sm:w-auto h-9 rounded-lg px-6 shadow-lg shadow-blue-500/20 font-bold">
              <Link href="/dashboard/services/new">
                <Plus className="mr-2 h-4 w-4" /> Catat Perbaikan
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                <TableHead className="py-3 px-6 text-xs font-bold uppercase tracking-wider">Tanggal & Tipe</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Aset Barang</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider hidden md:table-cell">Teknisi / Vendor</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Biaya</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider w-48">Progress</TableHead>
                <TableHead className="text-right pr-6 text-xs font-bold uppercase tracking-wider">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center h-40 text-slate-400 italic text-sm">{searchTerm ? 'Pencarian tidak ditemukan...' : 'Belum ada catatan servis.'}</TableCell></TableRow>
              ) : (
                filteredServices.map((service) => {
                  const status = getStatusInfo(service.status || 'COMPLETED');
                  return (
                    <TableRow key={service.id} className="group/row transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-slate-100 dark:border-slate-800">
                      <TableCell className="py-3 px-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-500">{new Date(service.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">{service.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{service.asset?.name || 'Aset Dihapus'}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{service.asset?.code || '-'}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{service.technician || 'Internal'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(service.cost)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter">
                            <span className={status.color.replace('bg-', 'text-')}>{status.label}</span>
                            <span>{status.progress}%</span>
                          </div>
                          <Progress value={status.progress} className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-900" indicatorClassName={status.color} />
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-md">
                            <Link href={`/dashboard/services/${service.id}`}>
                              <Eye className="h-4 w-4 text-slate-400" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
