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

interface ProcurementItem {
  id: number;
  itemName: string;
  qty: number;
  estimatedPrice: number;
  total: number;
  status: string;
  requester: string;
}



export function ProcurementReportButton() {
  const componentRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ProcurementItem[]>([]);

  // Header & Sig State
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
      const fetchData = async () => {
        try {
          const res = await api.get('/procurements');
          // Flatten items
          const flatData = res.data.flatMap((p: any) =>
            p.items.map((item: any) => ({
              id: item.id,
              itemName: item.name,
              qty: item.quantity,
              estimatedPrice: item.priceEst,
              total: item.totalEst,
              status: p.status,
              requester: p.requester?.fullName || p.requester?.username
            }))
          );
          setData(flatData);
        } catch (e) {
          console.error(e);
          toast.error("Gagal memuat data pengadaan");
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
    documentTitle: "Ringkasan_Pengadaan",
    onAfterPrint: () => toast.success("Laporan berhasil dicetak"),
  } as any);

  const columns = [
    { header: "Nama Barang", accessor: "itemName", width: "25%" },
    { header: "Pemohon", accessor: "requester", width: "20%" },
    { header: "Jml", accessor: "qty", width: "8%", render: (row: any) => row.qty },
    { header: "Harga Satuan", accessor: "estimatedPrice", width: "15%", render: (row: any) => `Rp ${row.estimatedPrice.toLocaleString('id-ID')}` },
    { header: "Total Est.", accessor: "total", width: "15%", render: (row: any) => `Rp ${row.total.toLocaleString('id-ID')}` },
    { header: "Status", accessor: "status" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full text-slate-700 justify-start">
          <Eye className="mr-2 h-4 w-4" /> Preview & Cetak PDF
        </Button>
      </DialogTrigger>

      <DialogContent className="w-screen h-screen max-w-none m-0 rounded-none flex flex-col p-0 gap-0 bg-slate-100">
        <VisuallyHidden><DialogTitle>Laporan Pengadaan</DialogTitle></VisuallyHidden>
        <div className="p-4 border-b bg-white flex justify-between items-center shadow-sm z-10 shrink-0">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Printer className="h-5 w-5 text-primary" />
              Preview: Ringkasan Pengadaan
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
            title="RINGKASAN USULAN PENGADAAN"
            subtitle="Tahun Anggaran Berjalan"
            filterDates={`Tahun ${new Date().getFullYear()}`}
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
