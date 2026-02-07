"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash, CheckCircle, Plus, AlertCircle } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';

export default function NewAuditPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [auditItems, setAuditItems] = useState<any[]>([]);

  useEffect(() => {
    api.get('/assets', { params: { limit: 100 } })
      .then(res => setAssets(res.data.items || []))
      .catch(console.error);
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
    <div className="mx-auto max-w-[1400px] space-y-6 font-sans">
      <div className="flex items-center gap-6">
        <BackButton className="h-9 px-3 border border-slate-200 rounded-lg" />
        <div>
          <h1 className="text-2xl font-black tracking-tightest text-slate-900 dark:text-slate-100 font-heading leading-none">Audit Baru</h1>
          <p className="mt-1 text-sm text-slate-500">Verifikasi fisik inventaris sekolah.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* RIGHT Column: Controls */}
        <div className="lg:col-span-4 space-y-4 order-1 lg:order-2">
          {/* Instrument Card */}
          <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Instrumen Audit</h3>
                <p className="text-slate-500 text-xs">Pilih aset untuk diverifikasi.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">Pilih Aset</Label>
                <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                  <SelectTrigger className="h-10 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm">
                    <SelectValue placeholder="Pilih kode aset..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg shadow-xl border-slate-200 dark:border-slate-800">
                    {assets.map(a => (
                      <SelectItem key={a.id} value={a.id} className="text-sm">{a.code} - {a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={addItem} className="w-full h-10 rounded-lg font-medium shadow-sm">
                <Plus className="w-4 h-4 mr-2" /> Tambah Item
              </Button>
            </div>
          </Card>

          {/* Procedure Card */}
          <Card className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm">
            <div className="p-5">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-blue-900 dark:text-blue-100">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Prosedur Audit
              </h3>
              <ul className="space-y-2.5">
                {[
                  "Verifikasi fisik barang",
                  "Cek label kode aset",
                  "Identifikasi kerusakan",
                  "Tambahkan catatan"
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs">
                    <span className="h-5 w-5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        {/* LEFT Column: Checklist */}
        <div className="lg:col-span-8 space-y-4 order-2 lg:order-1">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Daftar Verifikasi</h2>
            <Badge variant="secondary" className="rounded-md text-[10px] font-bold px-2 py-0">
              {auditItems.length} ITEM
            </Badge>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {auditItems.length === 0 ? (
              <div className="h-60 border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-300 flex-col gap-3">
                <CheckCircle className="w-10 h-10 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-tight opacity-40">Belum Ada Item</p>
              </div>
            ) : (
              auditItems.map((item, index) => (
                <Card key={item.assetId} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm hover:border-blue-200 transition-colors">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-blue-600 text-[10px] uppercase tracking-wider">{item.assetCode}</p>
                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">{item.assetName}</h4>
                    </div>

                    <div className="w-full md:w-44 space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Status Fisik</Label>
                      <Select value={item.condition} onValueChange={(v) => updateItem(index, 'condition', v)}>
                        <SelectTrigger className="h-8 rounded-md bg-slate-50 border-slate-200 px-2 text-xs font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-md border-slate-100">
                          <SelectItem value="GOOD" className="text-xs font-medium">Baik</SelectItem>
                          <SelectItem value="BROKEN_LIGHT" className="text-xs font-medium">Rusak Ringan</SelectItem>
                          <SelectItem value="BROKEN_HEAVY" className="text-xs font-medium">Rusak Berat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500 rounded-md shrink-0 self-end md:self-center" onClick={() => removeItem(index)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-3">
                    <Input
                      value={item.note}
                      onChange={(e) => updateItem(index, 'note', e.target.value)}
                      placeholder="Catatan..."
                      className="h-8 rounded-md bg-slate-50 border-slate-200 text-xs"
                    />
                  </div>
                </Card>
              ))
            )}
          </div>

          {auditItems.length > 0 && (
            <div className="flex justify-end pt-4">
              <Button size="lg" className="h-12 rounded-xl px-8 shadow-lg shadow-blue-500/20 font-bold" onClick={handleSubmit}>
                Simpan Laporan Audit
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
