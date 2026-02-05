"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import { QRGenerator } from '@/components/assets/QRGenerator';

export default function AssetDetailPage() {
  const { id } = useParams();
  const [asset, setAsset] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api.get(`/assets/${id}`).then(res => setAsset(res.data)).catch(console.error);
    }
  }, [id]);

  if (!asset) return <div className="p-8">Memuat data...</div>;

  return (
    <div className="space-y-6 container mx-auto px-6 py-6 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-slate-100">{asset.name}</h1>
          <p className="text-muted-foreground mt-1">Kode: {asset.code}</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-1">
          {asset.condition || 'Baik'}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Detail Aset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Asset Photo */}
            {asset.imageUrl && (
              <div className="mb-4">
                <img
                  src={asset.imageUrl}
                  alt={asset.name}
                  className="w-full max-h-64 object-cover rounded-lg border"
                />
              </div>
            )}
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Kategori</span>
              <span className="font-medium">{asset.category}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Tahun Pembelian</span>
              <span>{asset.purchaseYear || '-'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Lokasi Ruangan</span>
              <span>{asset.room?.name || 'Belum Ditentukan'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Status</span>
              <span>{asset.isBroken ? 'Rusak' : 'Aman'}</span>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Section */}
        <div className="space-y-6">
          <Card className="shadow-sm border-2 border-primary/10">
            <CardHeader>
              <CardTitle className="text-center">Label QR Digital</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <QRGenerator
                value={typeof window !== 'undefined' ? `${window.location.origin}/asset/${asset.id}` : `/asset/${asset.id}`}
                label={asset.name}
                code={asset.code}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Riwayat Perbaikan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm text-center py-4">
                Belum ada riwayat perbaikan.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
