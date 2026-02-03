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

interface Asset {
  id: string;
  code: string;
  name: string;
  category: string;
  condition: string;
  room?: { name: string };
}

import { AssetImportDialog } from '@/components/assets/asset-import-dialog';

// ... existing imports

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

      <div className="rounded-md border shadow-sm bg-white dark:bg-slate-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama Aset</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Kondisi</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">{asset.code}</TableCell>
                <TableCell>{asset.name}</TableCell>
                <TableCell>{asset.category}</TableCell>
                <TableCell>{asset.room?.name || '-'}</TableCell>
                <TableCell>{asset.condition}</TableCell>
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
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
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
