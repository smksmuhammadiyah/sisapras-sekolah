"use client";

import React, { useRef, useState, useEffect } from 'react';
import { PrintableLayout, ReportHeaderData, SignatureData } from './printable-layout';
import { ReportTable } from './report-table';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Printer, Edit, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import api from '@/lib/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DialogTitle } from '@radix-ui/react-dialog';



export function AssetReportButton() {
  const componentRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const [headerData, setHeaderData] = useState<ReportHeaderData>({
    province: "PIMPINAN CABANG MUHAMMADIYAH SATUI",
    agency: "MAJELIS PENDIDIKAN DASAR DAN MENENGAH",
    schoolName: "SMKS MUHAMMADIYAH SATUI",
    address: "Jl. KH. Ahmad Dahlan, No.07 Ds. Makmur Jaya, Kec. Satui, Kab. Tanah Bumbu (72275)",
    contacts: "NSPN : 69772942 NISS : 32215511 03 007 Telp: ... | Email: ..."
  });
  const [signatures, setSignatures] = useState<SignatureData[]>([
    { role: "Kepala Sekolah", name: "Loading...", nip: "..." },
    { role: "Wakasek Sarpras", name: "Loading...", nip: "..." }
  ]);

  // Load data & settings when dialog opens
  useEffect(() => {
    if (open) {
      // Fetch Assets - use limit=all to get everything for the report
      api.get('/assets', { params: { limit: 'all' } })
        .then(res => {
          // Response is now { items, meta }
          setData(res.data.items || []);
        })
        .catch(console.error);

      // Fetch School Settings for Header & Signatures
      const fetchSettings = async () => {
        try {
          const res = await api.get('/settings');
          const s = res.data;
          if (s) {
            setHeaderData(prev => ({
              ...prev,
              schoolName: s.name !== "SMK Negeri 1 Contoh" ? s.name : prev.schoolName,
              address: s.address !== "Jl. Pendidikan No. 1" ? s.address : prev.address,
              contacts: `NSPN : 69772942 NISS : 32215511 03 007 Telp: ${s.phone} | Email: ${s.email}`
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
        <Button variant="outline" className="gap-2">
          <Printer className="h-4 w-4" /> Preview
        </Button>
      </DialogTrigger>

      <DialogContent className="w-screen h-screen max-w-none m-0 rounded-none flex flex-col p-0 gap-0 bg-slate-100">
        <VisuallyHidden><DialogTitle>Laporan Aset</DialogTitle></VisuallyHidden>
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
            title="BUKU INDUK INVENTARIS BARANG"
            subtitle=""
            filterDates=""
            headerData={headerData}
            onHeaderChange={(field, val) => setHeaderData(prev => ({ ...prev, [field]: val }))}
            signatures={signatures}
            onSignatureChange={(idx, field, val) => {
              const newSigs = [...signatures];
              newSigs[idx] = { ...newSigs[idx], [field]: val };
              setSignatures(newSigs);
            }}
          >
            {/* Custom Table Implementation for Buku Induk Standards */}
            <table className="w-full border-collapse border border-black text-[10px]">
              <thead className="table-header-group">
                <tr className="bg-orange-400 print:bg-transparent break-inside-avoid text-black">
                  <th rowSpan={2} className="border border-black px-1 py-1 text-center font-bold w-[3%]">No</th>
                  <th rowSpan={2} className="border border-black px-1 py-1 text-center font-bold w-[8%]">Tgl Pembukuan</th>
                  <th rowSpan={2} className="border border-black px-1 py-1 text-center font-bold w-[10%]">Kode Barang</th>
                  <th rowSpan={2} className="border border-black px-1 py-1 text-center font-bold w-[15%]">Nama Barang</th>
                  <th rowSpan={2} className="border border-black px-1 py-1 text-center font-bold w-[12%]">Merk/Spesifikasi</th>
                  <th rowSpan={2} className="border border-black px-1 py-1 text-center font-bold w-[5%] leading-tight">Tahun<br />Perolehan</th>
                  <th rowSpan={2} className="border border-black px-1 py-1 text-center font-bold w-[7%] leading-tight">Asal<br />Barang</th>
                  <th rowSpan={2} className="border border-black px-1 py-1 text-center font-bold w-[3%]">Qty</th>
                  <th colSpan={3} className="border border-black px-1 py-1 text-center font-bold w-[9%]">Keadaan</th>
                  <th rowSpan={2} className="border border-black px-1 py-1 text-center font-bold w-[10%]">Harga</th>
                  <th rowSpan={2} className="border border-black px-1 py-1 text-center font-bold w-[8%]">Lokasi</th>
                  <th rowSpan={2} className="border border-black px-1 py-1 text-center font-bold w-[10%]">Ket</th>
                </tr>
                <tr className="bg-orange-400 print:bg-transparent break-inside-avoid text-black">
                  <th className="border border-black px-1 py-1 text-center font-bold bg-green-200 print:bg-transparent">B</th>
                  <th className="border border-black px-1 py-1 text-center font-bold bg-yellow-200 print:bg-transparent">RR</th>
                  <th className="border border-black px-1 py-1 text-center font-bold bg-red-200 print:bg-transparent">RB</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="border border-black px-4 py-8 text-center italic text-gray-500">Belum ada data aset.</td>
                  </tr>
                ) : (
                  data.map((row, idx) => (
                    <tr key={idx} className="break-inside-avoid hover:bg-gray-50 print:hover:bg-transparent">
                      <td className="border border-black px-1 py-1 text-center">{idx + 1}</td>
                      <td className="border border-black px-1 py-1 text-center">{row.purchaseDate ? new Date(row.purchaseDate).toLocaleDateString('id-ID') : '-'}</td>
                      <td className="border border-black px-1 py-1 font-mono text-[9px]">{row.code}</td>
                      <td className="border border-black px-1 py-1">{row.name}</td>
                      <td className="border border-black px-1 py-1">{[row.brand, row.spec].filter(Boolean).join(', ') || '-'}</td>
                      <td className="border border-black px-1 py-1 text-center">{row.purchaseYear || '-'}</td>
                      <td className="border border-black px-1 py-1 text-center">{row.origin || '-'}</td>
                      <td className="border border-black px-1 py-1 text-center">1</td>
                      {/* Conditions Checkbox */}
                      <td className="border border-black px-1 py-1 text-center font-bold">{row.condition === 'GOOD' ? 'v' : ''}</td>
                      <td className="border border-black px-1 py-1 text-center font-bold">{row.condition === 'BROKEN_LIGHT' ? 'v' : ''}</td>
                      <td className="border border-black px-1 py-1 text-center font-bold">{row.condition === 'BROKEN_HEAVY' ? 'v' : ''}</td>

                      <td className="border border-black px-1 py-1 text-right whitespace-nowrap">
                        {row.price ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.price).replace(',00', '') : '-'}
                      </td>
                      <td className="border border-black px-1 py-1 text-center">{row.room?.name || '-'}</td>
                      <td className="border border-black px-1 py-1 text-center text-[9px]">{row.assetStatus || row.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </PrintableLayout>
        </div>
      </DialogContent>
    </Dialog>
  );
}
