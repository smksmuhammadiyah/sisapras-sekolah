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
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

const serviceSchema = z.object({
  assetId: z.string().min(1, 'Aset wajib dipilih'),
  type: z.string().min(1, 'Jenis servis wajib diisi'),
  cost: z.coerce.number().min(0, 'Biaya tidak boleh negatif'),
  notes: z.string().optional(),
  technician: z.string().optional(),
});

export default function NewServicePage() {
  const router = useRouter();
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    api.get('/assets', { params: { limit: 100 } })
      .then(res => setAssets(res.data.items || []))
      .catch(console.error);
  }, []);

  const form = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: { assetId: '', type: '', cost: 0, notes: '', technician: '' },
  });

  async function onSubmit(values: z.infer<typeof serviceSchema>) {
    try {
      await api.post('/services', values);
      toast.success('Log perbaikan berhasil disimpan');
      router.push('/dashboard/services');
    } catch (error) {
      toast.error('Gagal menyimpan log perbaikan');
    }
  }

  return (
    <div className="space-y-12 font-sans">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-3xl font-bold font-heading">Catat Perbaikan Baru</h1>
      </div>

      <Card className="max-w-3xl shadow-md border-0 bg-white dark:bg-slate-950">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-blue-800 dark:text-blue-200 text-sm mb-6">
                <Wrench className="w-5 h-5 mt-0.5" />
                <p>Pastikan data perbaikan yang diinput sudah sesuai dengan nota atau laporan teknisi. Data biaya akan masuk ke laporan keuangan pemeliharaan.</p>
              </div>

              <FormField
                control={form.control}
                name="assetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih Aset</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Cari atau pilih aset yang diperbaiki..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assets.map(a => (
                          <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Perbaikan</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Ganti LCD, Install Ulang, Pembersihan" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biaya Perbaikan (Rp)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="h-11"
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          value={field.value?.toString() || ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="technician"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teknisi / Vendor</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama Teknisi atau Nama Toko Servis" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan Tambahan</FormLabel>
                    <FormControl>
                      <Input placeholder="Keterangan detail kendala atau tindakan..." className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
                <Button type="submit" size="lg" className="px-8 bg-blue-600 hover:bg-blue-700">Simpan Log</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
