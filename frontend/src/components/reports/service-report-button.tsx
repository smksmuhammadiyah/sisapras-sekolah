"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { generatePDFReport, ReportSettings } from '@/lib/pdf-generator';

interface Service {
  id: string;
  date: string;
  type: string;
  cost: number;
  technician?: string;
  notes?: string;
  asset: {
    code: string;
    name: string;
  };
  reportedBy?: {
    fullName?: string;
    username: string;
  };
}

export function ServiceReportButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      // Fetch settings and data
      const [reportSettingsRes, schoolSettingsRes, dataRes] = await Promise.all([
        api.get('/settings/report'),
        api.get('/settings'),
        api.get('/services/export/report-data'),
      ]);

      // Merge settings: use report settings for logos/layout, school settings for names
      const settings: ReportSettings = {
        ...reportSettingsRes.data,
        principalName: schoolSettingsRes.data.headmaster,
        vicePrincipalName: schoolSettingsRes.data.sarprasName,
      };
      const services: Service[] = dataRes.data;

      if (services.length === 0) {
        toast.warning('Tidak ada data servis untuk dicetak');
        return;
      }

      // Columns - portrait orientation (fewer columns)
      const columns = [
        'No',
        'Tanggal',
        'Kode Aset',
        'Nama Aset',
        'Jenis Servis',
        'Teknisi',
        'Biaya',
      ];

      // Transform data
      const data = services.map((service, index) => [
        (index + 1).toString(),
        new Date(service.date).toLocaleDateString('id-ID'),
        service.asset.code,
        service.asset.name,
        service.type,
        service.technician || '-',
        new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(service.cost),
      ]);

      // Generate PDF
      const doc = await generatePDFReport({
        title: 'LAPORAN RIWAYAT SERVIS',
        settings,
        columns,
        data,
        orientation: 'portrait', // Fewer columns
      });

      // Download
      doc.save(`Laporan-Servis-${new Date().toISOString().split('T')[0]}.pdf`);
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
