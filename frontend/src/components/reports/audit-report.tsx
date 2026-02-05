"use client";

import React, { useRef, useState, useEffect } from 'react';
import { PrintableLayout, ReportHeaderData, SignatureData } from './printable-layout';
import { ReportTable } from './report-table';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Printer, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import api from '@/lib/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DialogTitle } from '@radix-ui/react-dialog';



export function AuditReportButton() {
  const componentRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const [headerData, setHeaderData] = useState<ReportHeaderData>({
    province: "PEMERINTAH PROVINSI JAWA BARAT",
    agency: "DINAS PENDIDIKAN",
    schoolName: "Loading...",
    address: "Loading...",
    contacts: "Loading...",
    logoLeft: "",
    logoRight: ""
  });

  const [signatures, setSignatures] = useState<SignatureData[]>([
    { role: "Kepala Sekolah", name: "Loading...", nip: "..." },
    { role: "Wakasek Sarpras", name: "Loading...", nip: "..." }
  ]);

  // Debounce ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleHeaderChange = (field: keyof ReportHeaderData, value: string) => {
    setHeaderData(prev => {
      const newData = { ...prev, [field]: value };

      // Auto-save logic
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      if (field === 'logoLeft' || field === 'logoRight') {
        // Immediate save for files
        api.patch('/settings', { [field]: value }).then(() => toast.success("Logo disimpan"));
      } else {
        // Debounce for text
        saveTimeoutRef.current = setTimeout(() => {
          const payload: any = {};
          if (field === 'schoolName') payload.name = value;
          if (field === 'address') payload.address = value;

          if (Object.keys(payload).length > 0) {
            api.patch('/settings', payload);
          }
        }, 1000);
      }
      return newData;
    });
  };

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const res = await api.get('/audits');
          const flatData = res.data.flatMap((audit: any) =>
            audit.items.map((item: any) => ({
              id: item.id,
              date: audit.date,
              auditor: audit.auditor?.fullName || audit.auditor?.username,
              assetName: item.asset?.name || 'Unknown',
              status: item.condition,
              notes: item.note
            }))
          );
          setData(flatData);
        } catch (e) {
          console.error(e);
          toast.error("Gagal memuat data audit");
        }
      };

      fetchData();

      const fetchSettings = async () => {
        try {
          const res = await api.get('/settings');
          const s = res.data;
          if (s) {
            setHeaderData(prev => ({
              ...prev,
              schoolName: s.name,
              address: s.address,
              contacts: `Telp: ${s.phone} | Email: ${s.email} ${s.website ? `| Website: ${s.website}` : ''}`,
              logoLeft: s.logoLeft || "",
              logoRight: s.logoRight || ""
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
        <VisuallyHidden><DialogTitle>Laporan Audit</DialogTitle></VisuallyHidden>
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
            onHeaderChange={handleHeaderChange}
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
