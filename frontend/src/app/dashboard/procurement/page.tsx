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
import { Plus, Eye, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

export default function ProcurementListPage() {
  const [procurements, setProcurements] = useState<any[]>([]);
  const [filteredProcurements, setFilteredProcurements] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    api.get('/procurements').then(res => {
      setProcurements(res.data);
      setFilteredProcurements(res.data);
    }).catch(console.error);
  };

  useEffect(() => {
    if (!searchTerm) {
      setFilteredProcurements(procurements);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredProcurements(procurements.filter(p =>
        p.title.toLowerCase().includes(lower) ||
        (p.requester?.fullName || '').toLowerCase().includes(lower) ||
        p.status.toLowerCase().includes(lower) ||
        p.priority.toLowerCase().includes(lower)
      ));
    }
  }, [searchTerm, procurements]);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan/menghapus usulan ini?')) return;
    try {
      await api.delete(`/procurements/${id}`);

      setProcurements(procurements.filter(p => p.id !== id));
      setFilteredProcurements(filteredProcurements.filter(p => p.id !== id));

      toast.success("Usulan dihapus", {
        action: {
          label: 'Batalkan',
          onClick: async () => {
            try {
              await api.patch(`/procurements/${id}/restore`);
              toast.success("Usulan dikembalikan");
              loadData();
            } catch (e) {
              toast.error("Gagal mengembalikan usulan");
            }
          }
        },
        duration: 5000,
      });
    } catch (e) { toast.error("Gagal menghapus"); }
  }

  return (
    <div className="space-y-6 container mx-auto px-6 py-6 font-sans">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-slate-100">Daftar Usulan</h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <SearchInput onSearch={setSearchTerm} className="w-full md:w-64" placeholder="Cari usulan..." />
          <Button asChild>
            <Link href="/dashboard/procurement/new">
              <Plus className="mr-2 h-4 w-4" /> Buat Usulan Baru
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border shadow-sm bg-white dark:bg-slate-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Judul Usulan</TableHead>
              <TableHead>Pengaju</TableHead>
              <TableHead>Prioritas</TableHead>
              <TableHead>Total Anggaran</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProcurements.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{new Date(p.createdAt).toLocaleDateString('id-ID')}</TableCell>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell>{p.requester?.fullName || p.requester?.username}</TableCell>
                <TableCell>
                  <Badge variant={p.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                    {p.priority === 'HIGH' ? 'Tinggi' : p.priority === 'NORMAL' ? 'Normal' : 'Rendah'}
                  </Badge>
                </TableCell>
                <TableCell>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(p.totalBudget)}</TableCell>
                <TableCell>
                  <Badge variant={p.status === 'APPROVED' ? 'default' : p.status === 'REJECTED' ? 'destructive' : 'outline'}>
                    {p.status === 'APPROVED' ? 'Disetujui' : p.status === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/procurement/${p.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {(user?.role === 'ADMIN' || (user?.id === p.requesterId && p.status === 'PENDING')) && (
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(p.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredProcurements.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  {searchTerm ? 'Tidak ada usulan yang cocok.' : 'Belum ada data usulan.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
