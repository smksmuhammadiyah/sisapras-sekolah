"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trash, CheckCircle } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';

export default function NewAuditPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [auditItems, setAuditItems] = useState<any[]>([]);

  useEffect(() => {
    api.get('/assets').then(res => setAssets(res.data)).catch(console.error);
  }, []);

  const addItem = () => {
    if (!selectedAsset) return;
    const asset = assets.find(a => a.id === selectedAsset);
    if (auditItems.find(i => i.assetId === selectedAsset)) {
      toast.error("Aset sudah ada dalam daftar audit");
      return;
    }

    setAuditItems([...auditItems, {
      assetId: selectedAsset,
      assetName: asset.name,
      assetCode: asset.code,
      condition: 'GOOD',
      note: ''
    }]);
    setSelectedAsset('');
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...auditItems];
    newItems[index][field] = value;
    setAuditItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...auditItems];
    newItems.splice(index, 1);
    setAuditItems(newItems);
  };

  const handleSubmit = async () => {
    if (auditItems.length === 0) {
      toast.error("Tambahkan minimal satu aset untuk diaudit");
      return;
    }

    try {
      await api.post('/audits', {
        status: 'COMPLETED',
        items: auditItems.map(({ assetId, condition, note }) => ({
          assetId,
          condition,
          note
        }))
      });
      toast.success("Laporan audit berhasil disimpan");
      router.push('/dashboard/audits');
    } catch (error) {
      toast.error("Gagal menyimpan audit");
    }
  };

  return (
    <div className="space-y-6 container mx-auto px-4 md:px-6 py-6 pb-20">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-3xl font-bold font-heading">Audit / Stock Opname Baru</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm border-blue-100 dark:border-blue-900">
            <CardHeader className="bg-blue-50/50 dark:bg-blue-900/20">
              <CardTitle className="text-lg text-blue-800 dark:text-blue-200">Pilih Aset untuk Diaudit</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Cari Aset</Label>
                <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                  <SelectTrigger className="bg-white dark:bg-slate-900">
                    <SelectValue placeholder="Pilih atau cari kode aset..." />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addItem} className="w-full bg-blue-600 hover:bg-blue-700">
                <CheckCircle className="w-4 h-4 mr-2" /> Tambahkan ke Daftar
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white border-0">
            <CardContent className="p-6">
              <h3 className="font-bold mb-2">Panduan Audit</h3>
              <ul className="text-sm text-slate-300 space-y-2 list-disc pl-4">
                <li>Cek fisik barang secara langsung.</li>
                <li>Pastikan label QR code masih terbaca.</li>
                <li>Catat kerusakan sekecil apapun di kolom catatan.</li>
                <li>Pilih kondisi "Rusak Berat" jika aset tidak bisa dipakai sama sekali.</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: List & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Daftar Pengecekan <span className="text-sm font-normal text-muted-foreground">({auditItems.length} aset)</span>
          </h2>

          <div className="space-y-4 min-h-[300px]">
            {auditItems.length === 0 ? (
              <div className="h-40 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground flex-col gap-2">
                <p>Belum ada aset yang ditambahkan.</p>
                <p className="text-sm">Gunakan form di sebelah kiri untuk memulai.</p>
              </div>
            ) : (
              auditItems.map((item, index) => (
                <Card key={item.assetId} className="shadow-sm border-l-4 border-l-blue-500">
                  <CardContent className="p-4 flex flex-col md:flex-row items-start gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <p className="font-mono font-bold text-blue-600 text-xs mb-1">{item.assetCode}</p>
                      <p className="font-medium text-lg leading-none">{item.assetName}</p>
                    </div>

                    <div className="w-full md:w-[180px] space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Kondisi Fisik</Label>
                      <Select
                        value={item.condition}
                        onValueChange={(v) => updateItem(index, 'condition', v)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GOOD">Baik / Layak</SelectItem>
                          <SelectItem value="BROKEN_LIGHT">Rusak Ringan</SelectItem>
                          <SelectItem value="BROKEN_HEAVY">Rusak Berat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 w-full space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Catatan Temuan</Label>
                      <Input
                        value={item.note}
                        onChange={(e) => updateItem(index, 'note', e.target.value)}
                        placeholder="Contoh: Kaki meja goyang..."
                        className="h-9"
                      />
                    </div>

                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 mt-5 md:mt-0" onClick={() => removeItem(index)}>
                      <Trash className="h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {auditItems.length > 0 && (
            <div className="sticky bottom-6 flex justify-end">
              <Button size="lg" className="w-full md:w-auto shadow-xl" onClick={handleSubmit}>Selesai & Simpan Audit</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
