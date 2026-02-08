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
import { Plus, ArrowRightLeft, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination-controls';

export default function StockListPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isMounted, setIsMounted] = useState(false);
  const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    api.get('/stock/items').then(res => {
      setItems(res.data);
      setFilteredItems(res.data);
    }).catch(console.error);
  };

  useEffect(() => {
    if (!searchTerm) {
      setFilteredItems(items);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredItems(items.filter(i =>
        i.name.toLowerCase().includes(lower) ||
        i.unit.toLowerCase().includes(lower)
      ));
    }
    setPage(1);
  }, [searchTerm, items]);

  const paginatedItems = filteredItems.slice((page - 1) * limit, page * limit);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/stock/items/${itemToDelete}`);
      toast.success('Item berhasil dihapus');
      loadData();
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (e) {
      toast.error('Gagal menghapus item');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-12 font-sans">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading truncate">Stok Habis Pakai</h1>
            <p className="text-slate-500 mt-1 text-xs sm:text-sm leading-relaxed max-w-2xl">Monitor persediaan barang habis pakai sekolah.</p>
          </div>
          {isMounted && isAdminOrStaff && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" asChild className="rounded-lg h-9 font-bold flex-1 sm:flex-none">
                <Link href="/dashboard/stock/transaction">
                  <ArrowRightLeft className="mr-2 h-4 w-4" /> Transaksi
                </Link>
              </Button>
              <Button asChild size="sm" className="rounded-lg px-4 h-9 shadow-lg shadow-primary/20 font-bold flex-1 sm:flex-none transition-all hover:scale-[1.02]">
                <Link href="/dashboard/stock/new">
                  <Plus className="mr-2 h-4 w-4" /> Item Baru
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="w-full sm:max-w-md">
          <SearchInput onSearch={setSearchTerm} className="w-full h-10 rounded-xl shadow-sm bg-white dark:bg-slate-950" placeholder="Cari nama barang atau satuan..." />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                <TableHead className="py-3 px-6 text-xs font-bold uppercase tracking-wider">Nama Barang</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-center">Stok Saat Ini</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-center">Minimal Stok</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-center">Satuan</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-center">Status</TableHead>
                {isAdminOrStaff && <TableHead className="text-right pr-6 text-xs font-bold uppercase tracking-wider">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((item) => (
                <TableRow key={item.id} className="group/row transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-slate-100 dark:border-slate-800">
                  <TableCell className="py-3 px-6 font-bold text-sm text-slate-900 dark:text-slate-100">{item.name}</TableCell>
                  <TableCell className="text-center font-black text-sm text-slate-900 dark:text-slate-100">{item.quantity}</TableCell>
                  <TableCell className="text-center text-sm text-slate-500 font-medium">{item.minStock}</TableCell>
                  <TableCell className="text-center text-sm text-slate-600 dark:text-slate-400">{item.unit}</TableCell>
                  <TableCell className="text-center">
                    {item.quantity <= item.minStock ? (
                      <Badge variant="destructive" className="rounded-md px-2 py-0 text-[10px] font-bold uppercase tracking-wider">Stok Menipis</Badge>
                    ) : (
                      <Badge variant="default" className="rounded-md px-2 py-0 text-[10px] font-bold uppercase tracking-wider bg-green-500 hover:bg-green-600 border-none">Aman</Badge>
                    )}
                  </TableCell>
                  {isAdminOrStaff && (
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end opacity-100 md:opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-destructive" onClick={() => {
                          setItemToDelete(item.id);
                          setIsDeleteDialogOpen(true);
                        }}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {paginatedItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdminOrStaff ? 6 : 5} className="text-center h-40 text-slate-400 font-medium italic">
                    {searchTerm ? 'Pencarian tidak membuahkan hasil...' : 'Belum ada data barang.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {paginatedItems.map((item) => (
            <div key={item.id} className="p-4 space-y-4 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Stok: <span className="font-bold text-slate-700 dark:text-slate-300">{item.quantity} {item.unit}</span></span>
                  </div>
                </div>
                {item.quantity <= item.minStock ? (
                  <Badge variant="destructive" className="rounded-md px-2 py-0 text-[10px] font-bold uppercase tracking-wider">Menipis</Badge>
                ) : (
                  <Badge variant="default" className="bg-green-500 border-none rounded-md px-2 py-0 text-[10px] font-bold uppercase tracking-wider">Aman</Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-900/50 mt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Min. Stok: {item.minStock}
                </span>
                {isAdminOrStaff && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                    setItemToDelete(item.id);
                    setIsDeleteDialogOpen(true);
                  }}>
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {paginatedItems.length === 0 && (
            <div className="p-12 text-center text-slate-400 font-medium italic text-sm">
              {searchTerm ? 'Pencarian tidak membuahkan hasil...' : 'Belum ada data barang.'}
            </div>
          )}
        </div>
      </div>

      {filteredItems.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filteredItems.length / limit)}
          onPageChange={setPage}
          itemsPerPage={limit}
          onItemsPerPageChange={setLimit}
          totalItems={filteredItems.length}
        />
      )}

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Hapus Item Stok?"
        description="Apakah Anda yakin ingin menghapus item ini? Riwayat transaksi mungkin akan terpengaruh."
      />
    </div>
  );
}
