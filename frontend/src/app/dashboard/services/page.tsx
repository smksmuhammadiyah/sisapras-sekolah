"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { SearchInput } from '@/components/ui/search-input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Eye, Wrench } from 'lucide-react';

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

  return (
    <div className="space-y-6 container mx-auto px-4 md:px-6 py-6 font-sans">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton className="hidden md:flex" />
          <h1 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Wrench className="w-8 h-8 opacity-70" /> Riwayat Perbaikan & Servis
          </h1>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <SearchInput onSearch={setSearchTerm} className="w-full md:w-64" placeholder="Cari servis..." />
          <Button asChild className="shadow-lg shadow-blue-500/20">
            <Link href="/dashboard/services/new">
              <Plus className="mr-2 h-4 w-4" /> Catat Perbaikan Baru
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Aset</TableHead>
                <TableHead>Jenis Servis</TableHead>
                <TableHead>Biaya</TableHead>
                <TableHead>Teknisi / Vendor</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>{new Date(service.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</TableCell>
                  <TableCell className="font-medium">{service.asset?.name || 'Aset Dihapus'}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {service.type}
                    </span>
                  </TableCell>
                  <TableCell>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(service.cost)}</TableCell>
                  <TableCell>{service.technician || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/services/${service.id}`}>
                        <Eye className="h-4 w-4 text-slate-500 hover:text-blue-600" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredServices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                    {searchTerm ? 'Tidak ada data yang cocok dengan pencarian.' : 'Belum ada riwayat perbaikan yang tercatat.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
