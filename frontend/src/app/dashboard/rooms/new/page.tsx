"use client";

import { RoomForm } from '@/components/rooms/room-form';
import { BackButton } from '@/components/ui/back-button';

export default function CreateRoomPage() {
  return (
    <div className="space-y-6 container mx-auto px-6 py-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-3xl font-bold font-heading">Tambah Ruangan Baru</h1>
      </div>
      <div className="rounded-xl border p-6 bg-white dark:bg-slate-950 shadow-sm">
        <RoomForm />
      </div>
    </div>
  );
}
