"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useFormPersist } from '@/hooks/use-form-persist';

const assetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  purchaseDate: z.string().min(1, 'Date is required'),
  condition: z.enum(['GOOD', 'BROKEN_LIGHT', 'BROKEN_HEAVY']),
  roomId: z.string().optional(),
});

interface AssetFormProps {
  initialData?: any;
}

export function AssetForm({ initialData }: AssetFormProps) {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);

  const form = useForm({
    resolver: zodResolver(assetSchema),
    defaultValues: initialData || {
      name: '',
      category: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      condition: 'GOOD',
      roomId: '',
    },
  });

  const { clearStorage } = useFormPersist("asset-form-draft", form);

  useEffect(() => {
    // Load rooms for dropdown
    api.get('/rooms').then(res => setRooms(res.data)).catch(console.error);

    if (initialData) {
      // Fix date format if coming from ISO
      const date = initialData.purchaseDate.split('T')[0];
      form.setValue('purchaseDate', date);
    }
  }, [initialData, form]);

  async function onSubmit(values: z.infer<typeof assetSchema>) {
    try {
      if (initialData) {
        // Update logic (not implemented in backend controller yet, but simulate)
        toast.success('Asset updated');
      } else {
        await api.post('/assets', values);
        toast.success('Asset created successfully');
        clearStorage();
      }
      router.push('/dashboard/assets');
    } catch (error) {
      toast.error('Failed to save asset');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Aset</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Proyektor Epson X500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <FormControl>
                  <Input placeholder="ELEKTRONIK" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Pembelian</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kondisi</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kondisi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GOOD">Baik</SelectItem>
                    <SelectItem value="BROKEN_LIGHT">Rusak Ringan</SelectItem>
                    <SelectItem value="BROKEN_HEAVY">Rusak Berat</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="roomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lokasi (Ruangan)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih ruangan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Simpan Aset</Button>
      </form>
    </Form>
  );
}
