"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { generatePDFReport, ReportSettings } from '@/lib/pdf-generator';

interface Lending {
  id: string;
  borrowDate: string;
  returnDate?: string;
  status: string;
  conditionBefore: string;
  conditionAfter?: string;
  asset: {
    code: string;
    name: string;
  };
  borrower: {
    fullName?: string;
    username: string;
  };
}

export function LendingReportButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      // Fetch settings and data
      const [reportSettingsRes, schoolSettingsRes, dataRes] = await Promise.all([
        api.get('/settings/report'),
        api.get('/settings'),
        api.get('/lending/export/report-data'),
      ]);

      // Merge settings
      const settings: ReportSettings = {
        ...reportSettingsRes.data,
        principalName: schoolSettingsRes.data.headmaster,
        vicePrincipalName: schoolSettingsRes.data.sarprasName,
      };
      const lendings: Lending[] = dataRes.data;

      if (lendings.length === 0) {
        toast.warning('Tidak ada data peminjaman untuk dicetak');
        return;
      }

      // Columns - landscape for more columns
      const columns = [
        'No',
        'Kode Aset',
        'Nama Aset',
        'Peminjam',
        'Tgl Pinjam',
        'Tgl Kembali',
        'Status',
        'Kondisi Awal',
        'Kondisi Akhir',
      ];

      // Transform data
      const data = lendings.map((lending, index) => [
        (index + 1).toString(),
        lending.asset.code,
        lending.asset.name,
        lending.borrower.fullName || lending.borrower.username,
        new Date(lending.borrowDate).toLocaleDateString('id-ID'),
        lending.returnDate ? new Date(lending.returnDate).toLocaleDateString('id-ID') : '-',
        lending.status,
        lending.conditionBefore,
        lending.conditionAfter || '-',
      ]);

      // Generate PDF
      const doc = await generatePDFReport({
        title: 'LAPORAN PEMINJAMAN ASET',
        settings,
        columns,
        data,
        orientation: 'landscape', // More columns fit better in landscape
      });

      // Download
      doc.save(`Laporan-Peminjaman-${new Date().toISOString().split('T')[0]}.pdf`);
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
