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
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { Pagination } from '@/components/ui/pagination-controls';

export default function RoomListPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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
    setPage(1); // Reset to page 1 on search
  }, [searchTerm, rooms]);

  const paginatedRooms = filteredRooms.slice((page - 1) * limit, page * limit);

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

  const handleDelete = async () => {
    if (!roomToDelete) return;
    setIsDeleting(true);
    try {
      const id = roomToDelete;
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

      setIsDeleteDialogOpen(false);
      setRoomToDelete(null);
    } catch (error) {
      toast.error('Gagal menghapus ruangan');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-12 font-sans">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading truncate">Data Ruangan</h1>
            <p className="text-slate-500 mt-1 text-xs sm:text-sm leading-relaxed max-w-2xl">Daftar ruangan dan lokasi penyimpanan aset sekolah.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <RoomImportDialog onSuccess={fetchRooms} />
            <Button asChild size="sm" className="rounded-lg px-4 h-9 shadow-lg shadow-primary/20 font-bold ml-auto sm:ml-0 transition-all hover:scale-[1.02]">
              <Link href="/dashboard/rooms/new">
                <Plus className="mr-2 h-4 w-4" /> Tambah Ruangan
              </Link>
            </Button>
          </div>
        </div>

        <div className="w-full sm:max-w-md">
          <SearchInput onSearch={setSearchTerm} className="w-full h-10 rounded-xl shadow-sm bg-white dark:bg-slate-950" placeholder="Cari nama, tipe, atau lokasi..." />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                <TableHead className="py-3 px-6 text-xs font-bold uppercase tracking-wider">Nama Ruangan</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Tipe</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Lokasi</TableHead>
                <TableHead className="text-right pr-6 text-xs font-bold uppercase tracking-wider">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRooms.map((room) => (
                <TableRow key={room.id} className="group/row transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-slate-100 dark:border-slate-800">
                  <TableCell className="py-3 px-6 font-bold text-sm text-slate-900 dark:text-slate-100">{room.name}</TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">{room.type}</TableCell>
                  <TableCell className="text-sm text-slate-500">{room.location}</TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-md">
                        <Link href={`/dashboard/rooms/${room.id}`}>
                          <Eye className="h-4 w-4 text-slate-400" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-md">
                        <Link href={`/dashboard/rooms/${room.id}/edit`}>
                          <Edit className="h-4 w-4 text-slate-400" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-destructive" onClick={() => {
                        setRoomToDelete(room.id);
                        setIsDeleteDialogOpen(true);
                      }}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRooms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-40 text-slate-400 font-medium italic">
                    {searchTerm ? 'Pencarian tidak membuahkan hasil...' : 'Belum ada data ruangan.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {paginatedRooms.map((room) => (
            <div key={room.id} className="p-4 space-y-4 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100">{room.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{room.type || 'RUANGAN'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium">{room.location || 'Tidak ada lokasi'}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-900/50 mt-2">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild className="h-8 px-3 text-xs gap-1.5 font-bold">
                    <Link href={`/dashboard/rooms/${room.id}`}>
                      <Eye className="h-3.5 w-3.5" /> Detail
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="h-8 px-3 text-xs gap-1.5 font-bold">
                    <Link href={`/dashboard/rooms/${room.id}/edit`}>
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </Link>
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                  setRoomToDelete(room.id);
                  setIsDeleteDialogOpen(true);
                }}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {filteredRooms.length === 0 && (
            <div className="p-12 text-center text-slate-400 font-medium italic text-sm">
              {searchTerm ? 'Pencarian tidak membuahkan hasil...' : 'Belum ada data ruangan.'}
            </div>
          )}
        </div>
      </div>

      {filteredRooms.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filteredRooms.length / limit)}
          onPageChange={setPage}
          itemsPerPage={limit}
          onItemsPerPageChange={setLimit}
          totalItems={filteredRooms.length}
        />
      )}

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Hapus Ruangan?"
        description="Apakah Anda yakin ingin menghapus ruangan ini? Semua aset di dalamnya akan kehilangan kaitan ruangan."
      />
    </div>
  );
}
