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
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { Pagination } from '@/components/ui/pagination-controls';

export default function ProcurementListPage() {
  const [procurements, setProcurements] = useState<any[]>([]);
  const [filteredProcurements, setFilteredProcurements] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [procurementToDelete, setProcurementToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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
    setPage(1);
  }, [searchTerm, procurements]);

  const paginatedProcurements = filteredProcurements.slice((page - 1) * limit, page * limit);

  const handleDelete = async () => {
    if (!procurementToDelete) return;
    setIsDeleting(true);
    try {
      const id = procurementToDelete;
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
      setIsDeleteDialogOpen(false);
      setProcurementToDelete(null);
    } catch (e) { toast.error("Gagal menghapus"); }
    finally { setIsDeleting(false); }
  }

  return (
    <div className="space-y-12 font-sans">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading truncate">Daftar Usulan</h1>
            <p className="text-slate-500 mt-1 text-xs sm:text-sm leading-relaxed max-w-2xl">Kelola usulan pengadaan barang dan jasa sekolah.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button asChild size="sm" className="rounded-lg px-4 h-9 shadow-lg shadow-primary/20 font-bold ml-auto sm:ml-0 transition-all hover:scale-[1.02]">
              <Link href="/dashboard/procurement/new">
                <Plus className="mr-2 h-4 w-4" /> Buat Usulan Baru
              </Link>
            </Button>
          </div>
        </div>

        <div className="w-full sm:max-w-md">
          <SearchInput onSearch={setSearchTerm} className="w-full h-10 rounded-xl shadow-sm bg-white dark:bg-slate-950" placeholder="Cari judul, pengusul, atau prioritas..." />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                <TableHead className="py-3 px-6 text-xs font-bold uppercase tracking-wider">Judul Usulan</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Pengusul</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-center">Prioritas</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-center">Status</TableHead>
                <TableHead className="text-right pr-6 text-xs font-bold uppercase tracking-wider">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProcurements.map((procurement) => (
                <TableRow key={procurement.id} className="group/row transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-slate-100 dark:border-slate-800">
                  <TableCell className="py-3 px-6 font-bold text-sm text-slate-900 dark:text-slate-100">{procurement.title}</TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                    {procurement.requester?.fullName || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={procurement.priority === 'HIGH' ? 'destructive' : 'secondary'} className="rounded-md px-2 py-0 text-[10px] font-bold uppercase tracking-wider">
                      {procurement.priority === 'HIGH' ? 'Tinggi' : procurement.priority === 'NORMAL' ? 'Normal' : 'Rendah'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={procurement.status === 'APPROVED' ? 'default' : procurement.status === 'REJECTED' ? 'destructive' : 'outline'} className="rounded-md px-2 py-0 text-[10px] font-bold uppercase tracking-wider">
                      {procurement.status === 'APPROVED' ? 'Disetujui' : procurement.status === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-md">
                        <Link href={`/dashboard/procurement/${procurement.id}`}>
                          <Eye className="h-4 w-4 text-slate-400" />
                        </Link>
                      </Button>
                      {(user?.role === 'ADMIN' || (user?.id === procurement.requesterId && procurement.status === 'PENDING')) && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-destructive" onClick={() => {
                          setProcurementToDelete(procurement.id);
                          setIsDeleteDialogOpen(true);
                        }}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedProcurements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-40 text-slate-400 font-medium italic">
                    {searchTerm ? 'Pencarian tidak membuahkan hasil...' : 'Belum ada data usulan.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {paginatedProcurements.map((procurement) => (
            <div key={procurement.id} className="p-4 space-y-4 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1 pr-2 overflow-hidden">
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">{procurement.title}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(procurement.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <Badge variant={procurement.status === 'APPROVED' ? 'default' : procurement.status === 'REJECTED' ? 'destructive' : 'outline'} className="rounded-md px-2 py-0 text-[10px] font-bold uppercase flex-shrink-0">
                  {procurement.status === 'APPROVED' ? 'Disetujui' : procurement.status === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pengaju</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{procurement.requester?.fullName || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Anggaran</p>
                  <p className="font-bold text-primary">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(procurement.totalBudget)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-900/50 mt-2">
                <Badge variant={procurement.priority === 'HIGH' ? 'destructive' : 'secondary'} className="rounded-md px-2 py-0 text-[10px] font-bold uppercase">
                  {procurement.priority === 'HIGH' ? 'Tinggi' : procurement.priority === 'NORMAL' ? 'Normal' : 'Rendah'}
                </Badge>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild className="h-8 px-3 text-xs gap-1.5 font-bold">
                    <Link href={`/dashboard/procurement/${procurement.id}`}>
                      <Eye className="h-3.5 w-3.5" /> Detail
                    </Link>
                  </Button>
                  {(user?.role === 'ADMIN' || (user?.id === procurement.requesterId && procurement.status === 'PENDING')) && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                      setProcurementToDelete(procurement.id);
                      setIsDeleteDialogOpen(true);
                    }}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {paginatedProcurements.length === 0 && (
            <div className="p-12 text-center text-slate-400 font-medium italic text-sm">
              {searchTerm ? 'Pencarian tidak membuahkan hasil...' : 'Belum ada data usulan.'}
            </div>
          )}
        </div>
      </div>

      {filteredProcurements.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filteredProcurements.length / limit)}
          onPageChange={setPage}
          itemsPerPage={limit}
          onItemsPerPageChange={setLimit}
          totalItems={filteredProcurements.length}
        />
      )}

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Hapus Usulan?"
        description="Apakah Anda yakin ingin menghapus usulan ini? Tindakan ini tidak dapat dibatalkan jika sudah disetujui."
      />
    </div>
  );
}
