"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { generatePDFReport, ReportSettings } from '@/lib/pdf-generator';
import jsPDF from 'jspdf';

interface Asset {
  id: string;
  code: string;
  name: string;
  category: string;
  brand?: string;
  condition: string;
  purchaseDate: string;
  price?: number;
  room?: { name: string };
  assetStatus?: string;
  imageUrl?: string;
}

export function AssetReportButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      // Fetch settings and data
      const [reportSettingsRes, schoolSettingsRes, dataRes] = await Promise.all([
        api.get('/settings/report'),
        api.get('/settings'),
        api.get('/assets/export/report-data'),
      ]);

      // Merge settings: use report settings for logos/layout, school settings for names
      const settings: ReportSettings = {
        ...reportSettingsRes.data,
        principalName: schoolSettingsRes.data.headmaster,
        vicePrincipalName: schoolSettingsRes.data.sarprasName,
      };
      const assets: Asset[] = dataRes.data;

      if (assets.length === 0) {
        toast.warning('Tidak ada data aset untuk dicetak');
        return;
      }

      // Prepare columns (landscape for many columns)
      const columns = [
        'No',
        'Kode',
        'Nama Aset',
        'Kategori',
        'Merek',
        'Ruangan',
        'Kondisi',
        'Status',
        'Tgl Beli',
        'Harga',
      ];

      // Transform data
      const data = assets.map((asset, index) => [
        (index + 1).toString(),
        asset.code,
        asset.name,
        asset.category,
        asset.brand || '-',
        asset.room?.name || '-',
        asset.condition,
        asset.assetStatus || '-',
        new Date(asset.purchaseDate).toLocaleDateString('id-ID'),
        asset.price
          ? new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }).format(asset.price)
          : '-',
      ]);

      // Generate PDF
      const doc = await generatePDFReport({
        title: 'LAPORAN DATA ASET',
        settings,
        columns,
        data,
        orientation: 'landscape', // Many columns
      });

      // Download
      doc.save(`Laporan-Aset-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Laporan berhasil dibuat!');
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error('Gagal membuat laporan: ' + (error.message || 'Error tidak diketahui'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generateReport}
      disabled={isGenerating}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Membuat Laporan...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          Cetak Laporan
        </>
      )}
    </Button>
  );
}
