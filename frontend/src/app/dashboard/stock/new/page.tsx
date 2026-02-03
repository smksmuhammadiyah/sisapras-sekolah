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

const stockSchema = z.object({
  name: z.string().min(1),
  unit: z.string().min(1),
  spec: z.string().optional(),
  minStock: z.coerce.number().min(0),
});

export default function NewStockItemPage() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(stockSchema),
    defaultValues: { name: '', unit: 'Pcs', spec: '', minStock: 5 },
  });

  async function onSubmit(values: z.infer<typeof stockSchema>) {
    try {
      await api.post('/stock/items', values);
      toast.success('Stock item created');
      router.push('/dashboard/stock');
    } catch (error) {
      toast.error('Failed to create item');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-heading">Tambah Stok Barang</h1>
      <div className="rounded-lg border p-6 bg-card max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Barang</FormLabel>
                  <FormControl><Input placeholder="Contoh: Kertas A4" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="spec"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spesifikasi (Opsional)</FormLabel>
                  <FormControl><Input placeholder="Contoh: 70mg, Putih" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Satuan</FormLabel>
                  <FormControl><Input placeholder="Rim / Box / Pcs" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stok Minimum (Alert)</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value as number} onChange={(e) => field.onChange(e.target.valueAsNumber)} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Simpan Stok</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
