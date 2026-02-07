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
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AssetReportButton } from '@/components/reports/asset-report-button';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import dynamic from 'next/dynamic';

const AssetImportDialog = dynamic(() => import('@/components/assets/asset-import-dialog').then(mod => mod.AssetImportDialog), {
  loading: () => <Button variant="outline" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</Button>,
  ssr: false
});

interface Asset {
  id: string;
  code: string;
  name: string;
  brand: string;
  category: string;
  condition: string; // GOOD/BROKEN_LIGHT/etc from backend enum
  assetStatus?: string; // Baru/Bekas/Hasil Pemutihan
  origin?: string; // BOS/Komite/etc
  purchaseYear?: number;
  room?: { name: string };
  price?: number;
}

export default function AssetListPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]); // We keep this for now but will use it less
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAssets(page, searchTerm);
  }, [page]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      else fetchAssets(1, searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchAssets = async (p: number, search: string) => {
    setIsLoading(true);
    try {
      const res = await api.get('/assets', {
        params: {
          page: p,
          limit: 20,
          search: search
        }
      });
      // The backend now returns { items, meta }
      const { items, meta } = res.data;
      setAssets(items);
      setFilteredAssets(items); // Since server already filtered
      setTotalPages(meta.totalPages);
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengambil data aset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!assetToDelete) return;
    setIsDeleting(true);
    try {
      const id = assetToDelete;
      await api.delete(`/assets/${id}`);

      // Optimistic update
      setAssets(prev => prev.filter(a => a.id !== id));
      setFilteredAssets(prev => prev.filter(a => a.id !== id));

      toast.success("Aset berhasil dihapus", {
        action: {
          label: 'Batalkan (Undo)',
          onClick: async () => {
            try {
              await api.patch(`/assets/${id}/restore`);
              toast.success("Aset dikembalikan");
              fetchAssets(page, searchTerm);
            } catch (e) {
              toast.error("Gagal mengembalikan aset");
            }
          }
        },
        duration: 5000,
      });

      setIsDeleteDialogOpen(false);
      setAssetToDelete(null);
    } catch (error) {
      toast.error('Gagal menghapus aset');
      fetchAssets(page, searchTerm);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper for Condition Badge
  const getConditionBadge = (c: string) => {
    switch (c) {
      case 'GOOD': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Baik</span>;
      case 'BROKEN_LIGHT': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Rusak Ringan</span>;
      case 'BROKEN_HEAVY': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Rusak Berat</span>;
      default: return c;
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 font-sans">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-slate-900 dark:text-slate-100 font-heading truncate">Data Aset</h1>
          <p className="text-slate-500 mt-1 text-sm leading-relaxed max-w-2xl">Kelola dan pantau inventaris sekolah secara real-time.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
          <SearchInput onSearch={setSearchTerm} className="w-full sm:w-72 h-9 rounded-lg shadow-sm" placeholder="Cari aset..." />
          <div className="flex items-center gap-2 shrink-0">
            <AssetReportButton />
            <AssetImportDialog onSuccess={() => fetchAssets(page, searchTerm)} />
            <Button asChild size="sm" className="rounded-lg px-4 h-9 shadow-lg shadow-primary/20 font-bold">
              <Link href="/dashboard/assets/new">
                <Plus className="mr-2 h-4 w-4" /> Tambah Aset
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
                <TableHead className="py-3 px-6 text-xs font-bold uppercase tracking-wider">Aset & Kode</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider hidden md:table-cell">Kategori / Merek</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Ruangan</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Kondisi</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider hidden lg:table-cell">Status</TableHead>
                <TableHead className="text-right pr-6 text-xs font-bold uppercase tracking-wider">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && assets.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center h-40"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" /></TableCell></TableRow>
              ) : assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-40 text-slate-400 font-medium italic">
                    {searchTerm ? 'Pencarian tidak membuahkan hasil...' : 'Belum ada data aset.'}
                  </TableCell>
                </TableRow>
              ) : (
                assets.map((asset) => (
                  <TableRow key={asset.id} className="group/row transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-slate-100 dark:border-slate-800">
                    <TableCell className="py-3 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{asset.name}</span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{asset.code}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-700 dark:text-slate-300">{asset.category}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase">{asset.brand || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{asset.room?.name || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="scale-90 origin-left">
                        {getConditionBadge(asset.condition)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline" className="rounded-md px-2 py-0 text-[10px] font-bold uppercase border-slate-200 text-slate-500">
                        {asset.assetStatus || 'Aktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-md">
                          <Link href={`/dashboard/assets/${asset.id}`}>
                            <Eye className="h-4 w-4 text-slate-400" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-md">
                          <Link href={`/dashboard/assets/${asset.id}/edit`}>
                            <Edit className="h-4 w-4 text-slate-400" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-destructive" onClick={() => {
                          setAssetToDelete(asset.id);
                          setIsDeleteDialogOpen(true);
                        }}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Hal {page} / {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-3"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-3"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Hapus Aset?"
        description="Apakah Anda yakin ingin menghapus aset ini? Aset yang dihapus akan masuk ke tempat sampah."
      />
    </div>
  );
}
