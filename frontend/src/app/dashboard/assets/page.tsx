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
import { Plus, Eye, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { AssetImportDialog } from '@/components/assets/asset-import-dialog';

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
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredAssets(assets.filter(a =>
      a.name.toLowerCase().includes(lower) ||
      a.code.toLowerCase().includes(lower) ||
      a.category.toLowerCase().includes(lower)
    ));
  }, [searchTerm, assets]);

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets');
      setAssets(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengambil data aset');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus aset ini?')) return;
    try {
      await api.delete(`/assets/${id}`);

      // Optimistic update
      setAssets(assets.filter(a => a.id !== id));

      toast.success("Aset berhasil dihapus", {
        action: {
          label: 'Batalkan (Undo)',
          onClick: async () => {
            try {
              await api.patch(`/assets/${id}/restore`);
              toast.success("Aset dikembalikan");
              fetchAssets();
            } catch (e) {
              toast.error("Gagal mengembalikan aset");
            }
          }
        },
        duration: 5000,
      });

    } catch (error) {
      toast.error('Gagal menghapus aset');
      fetchAssets();
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
    <div className="space-y-6 container mx-auto px-6 py-6 font-sans">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-slate-100">Data Aset</h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <SearchInput onSearch={setSearchTerm} className="w-full md:w-64" placeholder="Cari aset..." />
          <AssetImportDialog onSuccess={fetchAssets} />
          <Button asChild>
            <Link href="/dashboard/assets/new">
              <Plus className="mr-2 h-4 w-4" /> Tambah Aset
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border shadow-sm bg-white dark:bg-slate-950 overflow-x-auto">
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
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(asset.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredAssets.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                  {searchTerm ? 'Tidak ada aset yang cocok dengan pencarian.' : 'Belum ada data aset.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
