"use client";

import { AssetForm } from '@/components/assets/asset-form';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BackButton } from '@/components/ui/back-button';

export default function EditAssetPage() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);

  useEffect(() => {
    if (id) {
      api.get(`/assets/${id}`).then(res => setAsset(res.data)).catch(console.error);
    }
  }, [id]);

  if (!asset) return <div className="p-8 text-center text-muted-foreground">Memuat data aset...</div>;

  return (
    <div className="space-y-6 container mx-auto px-6 py-6 font-sans">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-3xl font-bold font-heading">Edit Data Aset</h1>
      </div>
      <div className="rounded-xl border p-6 bg-white dark:bg-slate-950 shadow-sm">
        <AssetForm initialData={asset} />
      </div>
    </div>
  );
}
