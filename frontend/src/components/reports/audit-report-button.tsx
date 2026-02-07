"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { generatePDFReport, ReportSettings } from '@/lib/pdf-generator';

interface Audit {
  id: string;
  date: string;
  status: string;
  auditor: {
    fullName?: string;
    username: string;
  };
  academicYear?: {
    name: string;
  };
  items: any[];
}

export function AuditReportButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      // Fetch settings and data
      const [reportSettingsRes, schoolSettingsRes, dataRes] = await Promise.all([
        api.get('/settings/report'),
        api.get('/settings'),
        api.get('/audits/export/report-data'),
      ]);

      // Merge settings
      const settings: ReportSettings = {
        ...reportSettingsRes.data,
        principalName: schoolSettingsRes.data.headmaster,
        vicePrincipalName: schoolSettingsRes.data.sarprasName,
      };
      const audits: Audit[] = dataRes.data;

      if (audits.length === 0) {
        toast.warning('Tidak ada data audit untuk dicetak');
        return;
      }

      // Columns
      const columns = [
        'No',
        'Tanggal',
        'Auditor',
        'Tahun Ajaran',
        'Jml Aset',
        'Status',
      ];

      // Transform data
      const data = audits.map((audit, index) => [
        (index + 1).toString(),
        new Date(audit.date).toLocaleDateString('id-ID'),
        audit.auditor.fullName || audit.auditor.username,
        audit.academicYear?.name || '-',
        audit.items.length.toString(),
        audit.status,
      ]);

      // Generate PDF
      const doc = await generatePDFReport({
        title: 'LAPORAN AUDIT / OPNAME ASET',
        settings,
        columns,
        data,
        orientation: 'portrait', // Audit summary fits in portrait
      });

      // Download
      doc.save(`Laporan-Audit-${new Date().toISOString().split('T')[0]}.pdf`);
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
