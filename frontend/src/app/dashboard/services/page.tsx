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

import { Pagination } from '@/components/ui/pagination-controls';

export default function ServiceListPage() {
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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
    setPage(1);
  }, [searchTerm, services]);

  const paginatedServices = filteredServices.slice((page - 1) * limit, page * limit);

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
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-heading truncate">Riwayat Servis</h1>
            <p className="text-slate-500 mt-1 text-xs sm:text-sm leading-relaxed max-w-2xl">Log pemeliharaan dan perbaikan aset sekolah.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <ServiceReportButton />
            <Button asChild size="sm" className="rounded-lg px-4 h-9 shadow-lg shadow-primary/20 font-bold ml-auto sm:ml-0 transition-all hover:scale-[1.02]">
              <Link href="/dashboard/services/new">
                <Plus className="mr-2 h-4 w-4" /> Catat Perbaikan
              </Link>
            </Button>
          </div>
        </div>

        <div className="w-full sm:max-w-md">
          <SearchInput onSearch={setSearchTerm} className="w-full h-10 rounded-xl shadow-sm bg-white dark:bg-slate-950" placeholder="Cari nama aset, tipe, atau teknisi..." />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                <TableHead className="py-3 px-6 text-xs font-bold uppercase tracking-wider">Tanggal & Tipe</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Aset Barang</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-center">Teknisi / Vendor</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-center">Biaya</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider w-48">Progress</TableHead>
                <TableHead className="text-right pr-6 text-xs font-bold uppercase tracking-wider">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center h-40 text-slate-400 font-medium italic">{searchTerm ? 'Pencarian tidak ditemukan...' : 'Belum ada catatan servis.'}</TableCell></TableRow>
              ) : (
                paginatedServices.map((service) => {
                  const status = getStatusInfo(service.status || 'COMPLETED');
                  return (
                    <TableRow key={service.id} className="group/row transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-slate-100 dark:border-slate-800">
                      <TableCell className="py-3 px-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-500">{new Date(service.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{service.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{service.asset?.name || 'Aset Dihapus'}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{service.asset?.code || '-'}</div>
                      </TableCell>
                      <TableCell className="text-center text-sm text-slate-600 dark:text-slate-400">
                        {service.technician || 'Internal'}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
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
                        <div className="flex justify-end opacity-100 md:opacity-0 group-hover/row:opacity-100 transition-opacity">
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

        {/* Mobile View Cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {paginatedServices.map((service) => {
            const status = getStatusInfo(service.status || 'COMPLETED');
            return (
              <div key={service.id} className="p-4 space-y-4 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1 pr-2 overflow-hidden">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(service.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">{service.asset?.name || 'Aset Dihapus'}</span>
                  </div>
                  <Badge variant="outline" className="rounded-md px-2 py-0 text-[10px] font-bold uppercase bg-blue-50 text-blue-600 border-blue-100 flex-shrink-0">
                    {service.type}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Teknisi: <span className="text-slate-700 dark:text-slate-300 font-bold">{service.technician || 'Internal'}</span></span>
                    <span className="font-black text-primary">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(service.cost)}
                    </span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter">
                      <span className={status.color.replace('bg-', 'text-')}>{status.label}</span>
                      <span className="text-slate-400">{status.progress}%</span>
                    </div>
                    <Progress value={status.progress} className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-900" indicatorClassName={status.color} />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-3 border-t border-slate-50 dark:border-slate-900/50 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Opsi Aksi</span>
                    <Badge variant="outline" className="rounded-md px-2 py-0 text-[10px] font-bold uppercase border-slate-200 text-slate-400">
                      {service.status === 'COMPLETED' ? 'Selesai' : 'Proses'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1 h-9 text-xs gap-1.5 font-bold shadow-sm">
                      <Link href={`/dashboard/services/${service.id}`}>
                        <Eye className="h-3.5 w-3.5" /> Lihat Detail Pelayanan
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredServices.length === 0 && (
            <div className="p-12 text-center text-slate-400 font-medium italic text-sm">
              {searchTerm ? 'Pencarian tidak ditemukan...' : 'Belum ada catatan servis.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
