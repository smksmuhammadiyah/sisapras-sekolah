"use client";

import { AssetForm } from '@/components/assets/asset-form';
import { BackButton } from '@/components/ui/back-button';

export default function CreateAssetPage() {
  return (
    <div className="space-y-12 font-sans">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-3xl font-bold font-heading">Tambah Aset Baru</h1>
      </div>
      <div className="rounded-xl border p-6 bg-white dark:bg-slate-950 shadow-sm">
        <AssetForm />
      </div>
    </div>
  );
}
