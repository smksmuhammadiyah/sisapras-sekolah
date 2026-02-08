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

const transactionSchema = z.object({
  itemId: z.string().min(1),
  type: z.enum(['IN', 'OUT']),
  quantity: z.coerce.number().min(1),
  notes: z.string().optional(),
});

export default function StockTransactionPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.get('/stock/items').then(res => setItems(res.data)).catch(console.error);
  }, []);

  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: { itemId: '', type: 'IN', quantity: 1, notes: '' },
  });

  async function onSubmit(values: z.infer<typeof transactionSchema>) {
    try {
      await api.post(`/stock/items/${values.itemId}/transactions`, {
        type: values.type,
        quantity: values.quantity,
        notes: values.notes,
      });
      toast.success('Transaction successful');
      router.push('/dashboard/stock');
    } catch (error) {
      toast.error('Failed to process transaction');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Stock Transaction</h1>
      <div className="rounded-lg border p-6 bg-card max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="itemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Item</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stock item" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {items.map(i => (
                        <SelectItem key={i.id} value={i.id}>{i.name} (Qty: {i.quantity})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="IN">IN (Barang Masuk)</SelectItem>
                      <SelectItem value="OUT">OUT (Barang Keluar)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      value={(field.value as number) ?? 0}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Submit Transaction</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
