"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash, Save } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';

export default function NewProcurementPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [items, setItems] = useState([
    { name: '', spec: '', quantity: 1, priceEst: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { name: '', spec: '', quantity: 1, priceEst: 0 }]);
  };

  const updateItem = (index: number, field: keyof typeof items[0], value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.priceEst), 0);
  };

  const handleSubmit = async () => {
    if (!title || items.length === 0) {
      toast.error("Mohon isi judul dan minimal satu barang");
      return;
    }

    try {
      await api.post('/procurements', {
        title,
        description,
        priority,
        items
      });
      toast.success("Usulan berhasil dikirim");
      router.push('/dashboard/procurement');
    } catch (error) {
      toast.error("Gagal mengirim usulan");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6">
        <BackButton label="Kembali ke Daftar" className="hidden md:flex" />
        <h1 className="text-3xl font-bold tracking-tight">Buat Usulan Pengadaan</h1>
      </div>

      <Card className="shadow-sm border-2 border-slate-100 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Judul Proposal</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Peremajaan Komputer Lab 1"
                className="bg-white dark:bg-slate-900"
              />
            </div>
            <div className="space-y-2">
              <Label>Prioritas</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-white dark:bg-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">Tinggi (Mendesak)</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="LOW">Rendah</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Alasan / Deskripsi Kebutuhan</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan mengapa barang ini dibutuhkan..."
              className="bg-white dark:bg-slate-900 min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Daftar Barang</h2>
          <Button onClick={addItem} variant="secondary" size="sm">
            <Plus className="mr-2 h-4 w-4" /> Tambah Barang
          </Button>
        </div>

        {items.map((item, index) => (
          <Card key={index} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6 flex flex-col md:flex-row gap-4 items-start bg-slate-50/50 dark:bg-slate-900/20">
              <div className="grid gap-4 flex-1 w-full md:grid-cols-12">
                <div className="md:col-span-4 space-y-2">
                  <Label>Nama Barang</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    placeholder="Nama Item..."
                    className="bg-white"
                  />
                </div>
                <div className="md:col-span-4 space-y-2">
                  <Label>Spesifikasi</Label>
                  <Input
                    value={item.spec}
                    onChange={(e) => updateItem(index, 'spec', e.target.value)}
                    placeholder="Detail spek..."
                    className="bg-white"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Jumlah</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    className="bg-white"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Est. Harga</Label>
                  <Input
                    type="number"
                    min="0"
                    value={item.priceEst}
                    onChange={(e) => updateItem(index, 'priceEst', parseInt(e.target.value))}
                    className="bg-white"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-8"
                onClick={() => removeItem(index)}
              >
                <Trash className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-900 text-white rounded-xl shadow-lg gap-4">
        <div>
          <span className="text-slate-400 text-sm uppercase font-bold tracking-wider">Total Estimasi Biaya</span>
          <div className="text-3xl font-bold mt-1">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(calculateTotal())}
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none text-black border-white/20 hover:bg-white/10 hover:text-white" onClick={() => router.back()}>Batal</Button>
          <Button size="lg" className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white border-none" onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" /> Kirim Usulan
          </Button>
        </div>
      </div>
    </div>
  );
}
