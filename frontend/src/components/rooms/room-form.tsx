"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const roomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().optional(),
  location: z.string().optional(),
});

export function RoomForm() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(roomSchema),
    defaultValues: { name: '', type: '', location: '' },
  });

  async function onSubmit(values: z.infer<typeof roomSchema>) {
    try {
      await api.post('/rooms', values);
      toast.success('Room created successfully');
      router.push('/dashboard/rooms');
    } catch (error) {
      toast.error('Failed to save room');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Ruangan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Lab Komputer 1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Ruangan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Laboratorium" {...field} />
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
              <FormLabel>Lokasi / Gedung</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Gedung A, Lantai 2" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Ruangan'}
        </Button>
      </form>
    </Form>
  );
}
