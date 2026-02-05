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

import { RoomImportDialog } from '@/components/rooms/room-import-dialog';

export default function RoomListPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredRooms(rooms.filter(r =>
      r.name.toLowerCase().includes(lower) ||
      (r.type || '').toLowerCase().includes(lower) ||
      (r.location || '').toLowerCase().includes(lower)
    ));
  }, [searchTerm, rooms]);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
      setFilteredRooms(res.data); // Initial sync
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengambil data ruangan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus ruangan ini?')) return;
    try {
      await api.delete(`/rooms/${id}`);

      setRooms(rooms.filter(r => r.id !== id));
      setFilteredRooms(filteredRooms.filter(r => r.id !== id));

      toast.success("Ruangan berhasil dihapus", {
        action: {
          label: 'Batalkan',
          onClick: async () => {
            try {
              await api.patch(`/rooms/${id}/restore`);
              toast.success("Ruangan dikembalikan");
              fetchRooms();
            } catch (e) {
              toast.error("Gagal mengembalikan ruangan");
            }
          }
        },
        duration: 5000,
      });

    } catch (error) {
      toast.error('Gagal menghapus ruangan');
    }
  };

  return (
    <div className="space-y-6 container mx-auto px-4 md:px-6 py-6 font-sans">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-slate-100">Data Ruangan</h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <SearchInput onSearch={setSearchTerm} className="w-full md:w-64" placeholder="Cari ruangan..." />
          <RoomImportDialog onSuccess={fetchRooms} />
          <Button asChild>
            <Link href="/dashboard/rooms/new">
              <Plus className="mr-2 h-4 w-4" /> Tambah Ruangan
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Ruangan</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell>{room.type}</TableCell>
                  <TableCell>{room.location}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/rooms/${room.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/rooms/${room.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(room.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRooms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                    {searchTerm ? 'Tidak ada ruangan yang cocok.' : 'Belum ada data ruangan.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
