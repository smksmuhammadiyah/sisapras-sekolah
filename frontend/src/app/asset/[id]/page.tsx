"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Box, MapPin, Calendar, Wrench, Image as ImageIcon } from 'lucide-react';

export default function PublicAssetPage() {
  const { id } = useParams();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      // Fetch from public API (no auth required)
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/assets/public/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Asset not found');
          return res.json();
        })
        .then(data => {
          setAsset(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-pulse text-lg text-gray-600">Memuat data aset...</div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <Box className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Aset Tidak Ditemukan</h2>
            <p className="text-gray-500 mt-2">QR Code tidak valid atau aset sudah dihapus.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const conditionLabel = (c: string) => {
    switch (c) {
      case 'GOOD': return { label: 'Baik', color: 'bg-green-100 text-green-800' };
      case 'BROKEN_LIGHT': return { label: 'Rusak Ringan', color: 'bg-yellow-100 text-yellow-800' };
      case 'BROKEN_HEAVY': return { label: 'Rusak Berat', color: 'bg-red-100 text-red-800' };
      default: return { label: c, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const cond = conditionLabel(asset.condition);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <Box className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Detail Aset</h1>
          <p className="text-gray-500 text-sm mt-1">SMK Muhammadiyah</p>
        </div>

        {/* Asset Photo */}
        <Card className="mb-4 overflow-hidden shadow-lg">
          {asset.imageUrl ? (
            <img
              src={asset.imageUrl}
              alt={asset.name}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
              <ImageIcon className="h-16 w-16 text-gray-300" />
            </div>
          )}
        </Card>

        {/* Asset Info */}
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{asset.name}</CardTitle>
                <p className="text-sm font-mono text-gray-500 mt-1">{asset.code}</p>
              </div>
              <Badge className={cond.color}>{cond.label}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Box className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Kategori:</span>
              </div>
              <div className="text-sm font-medium text-right">{asset.category}</div>

              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Lokasi:</span>
              </div>
              <div className="text-sm font-medium text-right">{asset.room?.name || 'Belum ditentukan'}</div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Tahun:</span>
              </div>
              <div className="text-sm font-medium text-right">{asset.purchaseYear || '-'}</div>

              {asset.brand && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <Wrench className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Merk:</span>
                  </div>
                  <div className="text-sm font-medium text-right">{asset.brand}</div>
                </>
              )}
            </div>

            {/* Action for Lending */}
            <div className="pt-4 border-t">
              <a
                href="/login"
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Pinjam Barang Ini
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          SIM-SAPRAS © 2026 SMK Muhammadiyah
        </p>
      </div>
    </div>
  );
}
