"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackButton } from '@/components/ui/back-button';
import { Badge } from '@/components/ui/badge';
import { Wrench, Calendar, DollarSign, User } from 'lucide-react';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.get(`/services/${id}`)
        .then(res => setService(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Memuat data servis...</div>;
  if (!service) return <div className="p-8 text-center text-red-500">Data servis tidak ditemukan.</div>;

  return (
    <div className="space-y-12 font-sans">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-3xl font-bold font-heading">Detail Perbaikan & Servis</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-500" />
              Informasi Servis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-500">Tanggal</p>
                <p className="text-slate-900 dark:text-slate-100">
                  {new Date(service.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">{service.type}</Badge>
              <div>
                <p className="text-sm font-medium text-slate-500">Jenis Servis</p>
                <p className="text-slate-900 dark:text-slate-100">{service.type}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-500">Biaya</p>
                <p className="text-lg font-bold text-blue-600">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(service.cost)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-500">Teknisi / Vendor</p>
                <p className="text-slate-900 dark:text-slate-100">{service.technician || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              Informasi Aset
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Nama Aset</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{service.asset?.name || 'Aset Dihapus'}</p>
            </div>
            {service.asset?.code && (
              <div>
                <p className="text-sm font-medium text-slate-500">Kode Aset</p>
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  {service.asset.code}
                </code>
              </div>
            )}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-slate-500">Catatan Servis</p>
              <p className="mt-1 text-slate-600 dark:text-slate-400 italic">
                {service.notes || 'Tidak ada catatan tambahan.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
