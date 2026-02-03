"use client";

import React, { useRef, useState, useEffect } from 'react';
import { PrintableLayout, ReportHeaderData, SignatureData } from './printable-layout';
import { ReportTable } from './report-table';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Printer, Edit, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';

// Mock Data
const MOCK_ASSETS = [
  { id: 1, name: "Laptop Lenovo Thinkpad", code: "EL-2024-001", category: "Elektronik", condition: "Baik", room: { name: "Lab Komputer 1" }, purchaseDate: "2024-01-15", price: 15000000 },
  { id: 2, name: "Proyektor Epson", code: "EL-2023-045", category: "Elektronik", condition: "Rusak Ringan", room: { name: "Ruang Guru" }, purchaseDate: "2023-06-20", price: 8500000 },
  { id: 3, name: "Meja Guru Jati", code: "FR-2022-012", category: "Furniture", condition: "Baik", room: { name: "Kelas X-A" }, purchaseDate: "2022-03-10", price: 2500000 },
  { id: 4, name: "AC Daikin 1PK", code: "EL-2023-088", category: "Elektronik", condition: "Perlu Servis", room: { name: "Kantor TU" }, purchaseDate: "2023-09-01", price: 4200000 },
  { id: 5, name: "Lemari Arsip Besi", code: "FR-2021-005", category: "Furniture", condition: "Baik", room: { name: "Gudang" }, purchaseDate: "2021-11-15", price: 3000000 },
  { id: 6, name: "Papan Tulis Whiteboard", code: "FR-2024-010", category: "Furniture", condition: "Baik", room: { name: "Kelas X-B" }, purchaseDate: "2024-01-20", price: 750000 },
  { id: 7, name: "Router Mikrotik", code: "NT-2023-002", category: "Network", condition: "Baik", room: { name: "Server Room" }, purchaseDate: "2023-05-05", price: 3500000 },
];

export function AssetReportButton() {
  const componentRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const [headerData, setHeaderData] = useState<ReportHeaderData>({
    province: "PEMERINTAH PROVINSI JAWA BARAT",
    agency: "DINAS PENDIDIKAN",
    schoolName: "SMK NEGERI 1 CONTOH",
    address: "Jl. Pendidikan No. 123",
    contacts: "Loading..."
  });
  const [signatures, setSignatures] = useState<SignatureData[]>([
    { role: "Kepala Sekolah", name: "Loading...", nip: "..." },
    { role: "Wakasek Sarpras", name: "Loading...", nip: "..." }
  ]);

  // Load data & settings when dialog opens
  useEffect(() => {
    if (open) {
      setData(MOCK_ASSETS); // Replace with real asset fetch if ready

      // Fetch School Settings for Header & Signatures
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
        } catch (error) {
          console.error("Failed to load settings", error);
          toast.error("Gagal memuat data sekolah");
        }
      };
      fetchSettings();
    }
  }, [open]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Laporan_Aset_Lengkap",
    onAfterPrint: () => toast.success("Laporan berhasil dicetak"),
  } as any);

  // ... columns definition ...
  const columns = [
    { header: "Kode", accessor: "code", width: "15%" },
    { header: "Nama Aset", accessor: "name", width: "25%" },
    { header: "Kategori", accessor: "category", width: "15%" },
    { header: "Lokasi", accessor: "room.name", width: "15%", render: (row: any) => row.room?.name || "-" },
    { header: "Kondisi", accessor: "condition", width: "15%" },
    {
      header: "Tgl Perolehan",
      accessor: "purchaseDate",
      width: "15%",
      render: (row: any) => new Date(row.purchaseDate).toLocaleDateString('id-ID')
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-slate-700">
          <Eye className="mr-2 h-4 w-4" /> Preview & Cetak PDF
        </Button>
      </DialogTrigger>

      <DialogContent className="w-screen h-screen max-w-none m-0 rounded-none flex flex-col p-0 gap-0 bg-slate-100">
        <div className="p-4 border-b bg-white flex justify-between items-center shadow-sm z-10 shrink-0">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Printer className="h-5 w-5 text-primary" />
              Preview & Pengaturan Laporan
            </h3>
            <p className="text-sm text-slate-500">Edit langsung Kop Surat & Tanda Tangan di bawah ini. Perubahan tersimpan otomatis.</p>
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
            title="Laporan Inventaris Aset"
            subtitle="Daftar Lengkap Aset Sarana Prasarana"
            filterDates={`Per ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
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
