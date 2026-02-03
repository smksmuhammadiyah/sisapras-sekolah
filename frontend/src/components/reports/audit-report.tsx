"use client";

import React, { useRef, useState, useEffect } from 'react';
import { PrintableLayout, ReportHeaderData, SignatureData } from './printable-layout';
import { ReportTable } from './report-table';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Printer, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';

// Mock Data (Replace with API fetch)
const MOCK_AUDITS = [
  { id: 1, date: "2024-02-01", auditor: "Siti Aminah, S.Pd", assetName: "Laptop Lab 01 (L001)", status: "Baik", notes: "Kondisi fisik mulus, software update terkini." },
  { id: 2, date: "2024-02-01", auditor: "Siti Aminah, S.Pd", assetName: "Proyektor Aula (P005)", status: "Perlu Perbaikan", notes: "Lensa agak buram saat fokus maksimal." },
  { id: 3, date: "2024-01-28", auditor: "Budi Santoso", assetName: "Kursi Guru (K012)", status: "Rusak Berat", notes: "Patah kaki belakang, tidak layak pakai." },
  { id: 4, date: "2024-01-25", auditor: "Rina Wati", assetName: "AC Ruang TU", status: "Baik", notes: "Baru selesai maintenance rutin." },
];

export function AuditReportButton() {
  const componentRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const [headerData, setHeaderData] = useState<ReportHeaderData>({
    province: "PEMERINTAH PROVINSI JAWA BARAT",
    agency: "DINAS PENDIDIKAN",
    schoolName: "Loading...",
    address: "Loading...",
    contacts: "Loading..."
  });

  const [signatures, setSignatures] = useState<SignatureData[]>([
    { role: "Kepala Sekolah", name: "Loading...", nip: "..." },
    { role: "Wakasek Sarpras", name: "Loading...", nip: "..." }
  ]);

  useEffect(() => {
    if (open) {
      setData(MOCK_AUDITS);

      const fetchSettings = async () => {
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/settings`);
          const s = res.data;
          if (s) {
            setHeaderData(prev => ({
              ...prev,
              schoolName: s.name,
              address: s.address,
              contacts: `Telp: ${s.phone} | Email: ${s.email} ${s.website ? `| Website: ${s.website}` : ''}`
            }));
            setSignatures([
              { role: "Kepala Sekolah", name: s.headmaster, nip: s.nipHeadmaster },
              { role: "Wakasek Sarpras", name: s.sarprasName, nip: s.nipSarpras }
            ]);
          }
        } catch (error) { console.error(error); }
      };
      fetchSettings();
    }
  }, [open]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Laporan_Log_Audit",
    onAfterPrint: () => toast.success("Laporan berhasil dicetak"),
  } as any);

  const columns = [
    { header: "Tanggal", accessor: "date", width: "15%", render: (row: any) => new Date(row.date).toLocaleDateString("id-ID") },
    { header: "Auditor", accessor: "auditor", width: "20%" },
    { header: "Nama Aset", accessor: "assetName", width: "25%" },
    { header: "Status", accessor: "status", width: "15%" },
    { header: "Catatan", accessor: "notes" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full text-slate-700 justify-start">
          <Eye className="mr-2 h-4 w-4" /> Preview & Cetak PDF
        </Button>
      </DialogTrigger>

      <DialogContent className="w-screen h-screen max-w-none m-0 rounded-none flex flex-col p-0 gap-0 bg-slate-100">
        <div className="p-4 border-b bg-white flex justify-between items-center shadow-sm z-10 shrink-0">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Printer className="h-5 w-5 text-primary" />
              Preview: Log Audit
            </h3>
            <p className="text-sm text-slate-500">Sesuaikan Kop Surat & Tanda Tangan sebelum mencetak.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Tutup</Button>
            <Button onClick={() => handlePrint()}>
              <Download className="mr-2 h-4 w-4" /> Download / Cetak
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8 flex justify-center items-start">
          <PrintableLayout
            ref={componentRef}
            title="LOG AUDIT / OPNAME ASET"
            subtitle="Riwayat Pemeriksaan & Kondisi Aset"
            filterDates={`Bulan ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`}
            headerData={headerData}
            onHeaderChange={(field, val) => setHeaderData(prev => ({ ...prev, [field]: val }))}
            signatures={signatures}
            onSignatureChange={(idx, field, val) => {
              const newSigs = [...signatures];
              newSigs[idx] = { ...newSigs[idx], [field]: val };
              setSignatures(newSigs);
            }}
          >
            <ReportTable columns={columns} data={data} />
          </PrintableLayout>
        </div>
      </DialogContent>
    </Dialog>
  );
}
