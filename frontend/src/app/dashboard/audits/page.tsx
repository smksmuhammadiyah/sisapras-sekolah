"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AuditListPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [filteredAudits, setFilteredAudits] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/audits').then(res => {
      setAudits(res.data);
      setFilteredAudits(res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredAudits(audits);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredAudits(audits.filter(a =>
        (a.auditor?.fullName || '').toLowerCase().includes(lower) ||
        (a.auditor?.username || '').toLowerCase().includes(lower) ||
        a.status.toLowerCase().includes(lower)
      ));
    }
  }, [searchTerm, audits]);

  return (
    <div className="space-y-6 container mx-auto px-4 md:px-6 py-6 font-sans">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-slate-100">Daftar Audit</h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <SearchInput onSearch={setSearchTerm} className="w-full md:w-64" placeholder="Cari auditor atau status..." />
          <Button asChild>
            <Link href="/dashboard/audits/new">
              <Plus className="mr-2 h-4 w-4" /> Audit Baru
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border shadow-sm bg-white dark:bg-slate-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Auditor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Item Diperiksa</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAudits.map((audit) => (
              <TableRow key={audit.id}>
                <TableCell>{new Date(audit.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</TableCell>
                <TableCell>{audit.auditor?.fullName || audit.auditor?.username}</TableCell>
                <TableCell>
                  <Badge variant={audit.status === 'COMPLETED' ? 'default' : 'secondary'}>
                    {audit.status === 'COMPLETED' ? 'Selesai' : audit.status}
                  </Badge>
                </TableCell>
                <TableCell>{audit.items?.length || 0}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/audits/${audit.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredAudits.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  {searchTerm ? 'Tidak ada data audit yang cocok.' : 'Belum ada data audit.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
