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
import { Plus, ArrowRightLeft } from 'lucide-react';

export default function StockListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/stock/items').then(res => {
      setItems(res.data);
      setFilteredItems(res.data);
    }).catch(console.error);
  }, []);

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
  }, [searchTerm, items]);

  return (
    <div className="space-y-6 container mx-auto px-6 py-6 font-sans">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-slate-100">Stok Habis Pakai</h1>
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <SearchInput onSearch={setSearchTerm} className="w-full md:w-64" placeholder="Cari barang..." />
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" asChild className="flex-1 md:flex-none">
              <Link href="/dashboard/stock/transaction">
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Transaksi
              </Link>
            </Button>
            <Button asChild className="flex-1 md:flex-none">
              <Link href="/dashboard/stock/new">
                <Plus className="mr-2 h-4 w-4" /> Item Baru
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border shadow-sm bg-white dark:bg-slate-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Barang</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead>Stok Min.</TableHead>
              <TableHead>Qty Saat Ini</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.minStock}</TableCell>
                <TableCell className="font-bold">{item.quantity}</TableCell>
                <TableCell>
                  {item.quantity <= item.minStock ? (
                    <span className="text-destructive font-semibold">Stok Menipis</span>
                  ) : (
                    <span className="text-green-600">Aman</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  {searchTerm ? 'Tidak ada barang yang cocok.' : 'Belum ada data barang.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
