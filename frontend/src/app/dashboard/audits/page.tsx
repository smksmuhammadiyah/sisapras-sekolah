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
import { Plus, Eye, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { AuditReportButton } from '@/components/reports/audit-report-button';
import { Pagination } from '@/components/ui/pagination-controls';

export default function AuditListPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [filteredAudits, setFilteredAudits] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [auditToDelete, setAuditToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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
    setPage(1);
  }, [searchTerm, audits]);

  const paginatedAudits = filteredAudits.slice((page - 1) * limit, page * limit);

  const handleDelete = async () => {
    if (!auditToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/audits/${auditToDelete}`);
      setAudits(audits.filter(a => a.id !== auditToDelete));
      toast.success('Audit berhasil dihapus');
      setIsDeleteDialogOpen(false);
      setAuditToDelete(null);
    } catch (e) {
      toast.error('Gagal menghapus audit');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-12 font-sans">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading truncate">Daftar Audit</h1>
            <p className="text-slate-500 mt-1 text-xs sm:text-sm leading-relaxed max-w-2xl">Riwayat pemeriksaan fisik dan stock opname aset sekolah.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <AuditReportButton />
            <Button asChild size="sm" className="rounded-lg px-4 h-9 shadow-lg shadow-primary/20 font-bold ml-auto sm:ml-0 transition-all hover:scale-[1.02]">
              <Link href="/dashboard/audits/new">
                <Plus className="mr-2 h-4 w-4" /> Audit Baru
              </Link>
            </Button>
          </div>
        </div>

        <div className="w-full sm:max-w-md">
          <SearchInput onSearch={setSearchTerm} className="w-full h-10 rounded-xl shadow-sm bg-white dark:bg-slate-950" placeholder="Cari auditor atau status..." />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                <TableHead className="py-3 px-6 text-xs font-bold uppercase tracking-wider">Tanggal</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Auditor</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-center">Status</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-center">Item Diperiksa</TableHead>
                <TableHead className="text-right pr-6 text-xs font-bold uppercase tracking-wider">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAudits.map((audit) => (
                <TableRow key={audit.id} className="group/row transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-slate-100 dark:border-slate-800">
                  <TableCell className="py-3 px-6 font-medium text-sm">
                    {new Date(audit.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {audit.auditor?.fullName || audit.auditor?.username}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={audit.status === 'COMPLETED' ? 'default' : 'secondary'} className="rounded-md px-2 py-0 text-[10px] font-bold uppercase">
                      {audit.status === 'COMPLETED' ? 'Selesai' : audit.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-bold text-sm text-slate-600 dark:text-slate-400">
                    {audit.items?.length || 0}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-md">
                        <Link href={`/dashboard/audits/${audit.id}`}>
                          <Eye className="h-4 w-4 text-slate-400" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-destructive" onClick={() => {
                        setAuditToDelete(audit.id);
                        setIsDeleteDialogOpen(true);
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAudits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-40 text-slate-400 font-medium italic">
                    {searchTerm ? 'Pencarian tidak membuahkan hasil...' : 'Belum ada data audit.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {paginatedAudits.map((audit) => (
            <div key={audit.id} className="p-4 space-y-4 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {new Date(audit.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Auditor:</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {audit.auditor?.fullName || audit.auditor?.username || 'Unknown'}
                    </span>
                  </div>
                </div>
                <Badge variant={audit.status === 'COMPLETED' ? 'default' : 'outline'} className={audit.status === 'COMPLETED' ? 'bg-green-500 hover:bg-green-600 border-none' : 'text-slate-500'}>
                  {audit.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-900/50 mt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {audit.items?.length || 0} Item Diperiksa
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild className="h-8 px-3 text-xs gap-1.5 font-bold">
                    <Link href={`/dashboard/audits/${audit.id}`}>
                      <Eye className="h-3.5 w-3.5" /> Detail
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                    setAuditToDelete(audit.id);
                    setIsDeleteDialogOpen(true);
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {paginatedAudits.length === 0 && (
            <div className="p-12 text-center text-slate-400 font-medium italic text-sm">
              {searchTerm ? 'Pencarian tidak membuahkan hasil...' : 'Belum ada data audit.'}
            </div>
          )}
        </div>
      </div>

      {filteredAudits.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filteredAudits.length / limit)}
          onPageChange={setPage}
          itemsPerPage={limit}
          onItemsPerPageChange={setLimit}
          totalItems={filteredAudits.length}
        />
      )}

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Hapus Data Audit?"
        description="Apakah Anda yakin ingin menghapus data audit ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}
