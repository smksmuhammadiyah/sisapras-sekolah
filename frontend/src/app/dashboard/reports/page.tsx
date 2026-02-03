"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { RoleGuard } from '@/components/auth/role-guard';
import { AssetReportButton } from '@/components/reports/asset-report';
import { AuditReportButton } from '@/components/reports/audit-report';
import { ProcurementReportButton } from '@/components/reports/procurement-report';

export default function ReportsPage() {
  const handleDownload = (reportName: string) => {
    toast.info(`Sedang menyiapkan ${reportName}...`);

    // Simulate generation delay
    setTimeout(() => {
      try {
        if (reportName.endsWith('.xlsx')) {
          // Basic CSV generation as mock for Excel
          const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,Nama Aset,Kategori,Kondisi,Lokasi,Tanggal Beli\n"
            + "1,Proyektor Epson,Elektronik,Baik,Lab Komputer,2024-01-01\n"
            + "2,Meja Guru,Furniture,Rusak Ringan,Ruang Guru,2023-05-15\n"
            + "3,AC Daikin,Elektronik,Baik,Kantor,2022-11-20";

          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", "Laporan_Aset.csv"); // Validate as CSV for now
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success(`${reportName} Berhasil Diunduh`);
        } else {
          // For PDF, we can't easily generate client side without heavy lib, so we keep mock but better message
          // Or perform a "Print" action?
          // Let's just mock success for now but with a Note
          toast.success(`${reportName} Berhasil Diunduh (Simulasi)`);
        }
      } catch (e) {
        toast.error("Gagal mengunduh file");
      }
    }, 1500);
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'STAFF']}>
      <div className="space-y-6 container mx-auto px-6 py-6 font-sans">
        <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-slate-100 mb-6">Laporan & Arsip</h1>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:bg-muted/50 transition-colors shadow-sm hover:shadow-md">
            <CardHeader>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Laporan Inventaris Aset</CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Ekspor daftar lengkap aset beserta kondisinya.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <AssetReportButton />
                <Button variant="outline" className="w-full justify-start text-slate-700" onClick={() => handleDownload('Laporan_Aset.xlsx')}>
                  <Download className="mr-2 h-4 w-4" /> Download Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:bg-muted/50 transition-colors shadow-sm hover:shadow-md">
            <CardHeader>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Log Audit / Opname</CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Riwayat audit dan pemeriksaan rutin aset sekolah.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditReportButton />
            </CardContent>
          </Card>

          <Card className="hover:bg-muted/50 transition-colors shadow-sm hover:shadow-md">
            <CardHeader>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Ringkasan Pengadaan</CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Rekapitulasi usulan yang disetujui dan ditunda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProcurementReportButton />
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard >
  );
}
