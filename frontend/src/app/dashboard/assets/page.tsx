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
import { Plus, Eye, Edit, Trash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AssetReportButton } from '@/components/reports/asset-report';
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
    <div className="space-y-10 font-sans">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-slate-100">Data Aset</h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <SearchInput onSearch={setSearchTerm} className="w-full md:w-64" placeholder="Cari aset..." />
          <AssetReportButton />
          <AssetImportDialog onSuccess={() => fetchAssets(page, searchTerm)} />
          <Button asChild>
            <Link href="/dashboard/assets/new">
              <Plus className="mr-2 h-4 w-4" /> Tambah Aset
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border shadow-sm bg-white dark:bg-slate-950 overflow-x-auto relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama Aset</TableHead>
              <TableHead>Merk/Spec</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Asal</TableHead>
              <TableHead>Tahun</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Kondisi</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="font-mono text-xs">{asset.code}</TableCell>
                <TableCell className="font-medium">
                  <div>{asset.name}</div>
                  {asset.assetStatus && <div className="text-[10px] text-muted-foreground uppercase">{asset.assetStatus}</div>}
                </TableCell>
                <TableCell>{asset.brand || '-'}</TableCell>
                <TableCell>{asset.category}</TableCell>
                <TableCell>{asset.origin || '-'}</TableCell>
                <TableCell>{asset.purchaseYear || (asset.assetStatus === 'Hasil Pemutihan' ? 'Pemutihan' : '-')}</TableCell>
                <TableCell>{asset.room?.name || '-'}</TableCell>
                <TableCell>{getConditionBadge(asset.condition)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/assets/${asset.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/assets/${asset.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                      setAssetToDelete(asset.id);
                      setIsDeleteDialogOpen(true);
                    }}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredAssets.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                  {searchTerm ? 'Tidak ada aset yang cocok dengan pencarian.' : 'Belum ada data aset.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

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
