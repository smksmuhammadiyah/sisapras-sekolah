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

export default function AuditListPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [filteredAudits, setFilteredAudits] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [auditToDelete, setAuditToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading">Daftar Audit</h1>
          <p className="text-muted-foreground mt-2">Riwayat pemeriksaan fisik dan stock opname aset sekolah.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <SearchInput onSearch={setSearchTerm} className="w-full md:w-72" placeholder="Cari auditor atau status..." />
          <Button asChild className="shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            <Link href="/dashboard/audits/new">
              <Plus className="mr-2 h-4 w-4" /> Audit Baru
            </Link>
          </Button>
          <AuditReportButton />
        </div>
      </div>

      <div className="pt-4">

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
                    <Button variant="ghost" size="icon" onClick={() => {
                      setAuditToDelete(audit.id);
                      setIsDeleteDialogOpen(true);
                    }}>
                      <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
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

        <DeleteConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          title="Hapus Data Audit?"
          description="Apakah Anda yakin ingin menghapus data audit ini? Tindakan ini tidak dapat dibatalkan."
        />
      </div>
    </div>
  );
}
