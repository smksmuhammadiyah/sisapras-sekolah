"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { BackButton } from '@/components/ui/back-button';
import { Save } from 'lucide-react';

const roomSchema = z.object({
  name: z.string().min(1, 'Nama ruangan wajib diisi'),
  type: z.string().optional(),
  location: z.string().optional(),
});

export default function EditRoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(roomSchema),
    defaultValues: { name: '', type: '', location: '' },
  });

  useEffect(() => {
    if (id) {
      api.get(`/rooms/${id}`).then(res => {
        form.reset({
          name: res.data.name,
          type: res.data.type || '',
          location: res.data.location || '',
        });
        setLoading(false);
      }).catch(() => {
        toast.error("Gagal memuat data ruangan");
      });
    }
  }, [id, form]);

  async function onSubmit(values: z.infer<typeof roomSchema>) {
    try {
      // await api.patch(`/rooms/${id}`, values); 
      // Simulated Update
      toast.success('Data ruangan berhasil diperbarui (Simulasi)');
      router.push('/dashboard/rooms');
    } catch (error) {
      toast.error('Gagal memperbarui data ruangan');
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Memuat data...</div>;

  return (
    <div className="space-y-6 container mx-auto px-6 py-6 font-sans">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-3xl font-bold font-heading">Edit Ruangan</h1>
      </div>

      <div className="rounded-xl border p-8 bg-white dark:bg-slate-950 shadow-sm max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Ruangan</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-11" placeholder="Contoh: Lab Komputer 1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Ruangan</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-11" placeholder="Contoh: Laboratorium" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasi</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-11" placeholder="Contoh: Gedung A Lt. 2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
                <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
