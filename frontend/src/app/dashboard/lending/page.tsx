"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { QrCode, RotateCcw, Plus, Loader2 } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '@/context/auth-context';

export default function LendingPage() {
  const { user } = useAuth();
  const [lendings, setLendings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [selectedLending, setSelectedLending] = useState<any>(null);
  const [assetCode, setAssetCode] = useState('');
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [borrowerName, setBorrowerName] = useState('');
  const [conditionBefore, setConditionBefore] = useState('GOOD');
  const [conditionAfter, setConditionAfter] = useState('GOOD');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
    loadAssets();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/lending');
      setLendings(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadAssets = async () => {
    try {
      const res = await api.get('/assets');
      setAssets(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleScanOrSearch = () => {
    // Simple search by code
    const found = assets.find(a => a.code?.toLowerCase() === assetCode.toLowerCase() || a.id === assetCode);
    if (found) {
      setSelectedAsset(found);
      setConditionBefore(found.condition || 'GOOD');
      toast.success(`Aset ditemukan: ${found.name}`);
    } else {
      toast.error('Aset tidak ditemukan. Pastikan kode benar.');
    }
  };

  const handleBorrow = async () => {
    if (!selectedAsset || !borrowerName) {
      toast.error('Harap isi semua field');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/lending', {
        assetId: selectedAsset.id,
        borrowerId: user?.id,
        borrowerName,
        conditionBefore,
        notes,
      });
      toast.success('Peminjaman berhasil dicatat!');
      setIsBorrowDialogOpen(false);
      resetForm();
      loadData();
    } catch (e) {
      toast.error('Gagal mencatat peminjaman');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedLending) return;
    setSubmitting(true);
    try {
      await api.patch(`/lending/${selectedLending.id}/return`, { conditionAfter });
      toast.success('Pengembalian berhasil dicatat!');
      setIsReturnDialogOpen(false);
      loadData();
    } catch (e) {
      toast.error('Gagal mencatat pengembalian');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setAssetCode('');
    setSelectedAsset(null);
    setBorrowerName('');
    setConditionBefore('GOOD');
    setNotes('');
  };

  const openReturnDialog = (lending: any) => {
    setSelectedLending(lending);
    setConditionAfter(lending.conditionBefore);
    setIsReturnDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 container mx-auto px-4 md:px-6 py-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-heading">Daftar Peminjaman Barang</h1>
        <Button onClick={() => setIsBorrowDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Pinjam Barang
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Peminjaman</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{lendings.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Sedang Dipinjam</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-orange-500">{lendings.filter(l => l.status === 'BORROWED').length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Sudah Dikembalikan</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">{lendings.filter(l => l.status === 'RETURNED').length}</CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white dark:bg-slate-950 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal/Jam Pinjam</TableHead>
              <TableHead>Nama Peminjam</TableHead>
              <TableHead>Nama Barang</TableHead>
              <TableHead>Kondisi Awal</TableHead>
              <TableHead>Jam Kembali</TableHead>
              <TableHead>Kondisi Akhir</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center h-24"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
            ) : lendings.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center h-24 text-muted-foreground">Belum ada data peminjaman.</TableCell></TableRow>
            ) : (
              lendings.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{formatDate(l.borrowDate)}</TableCell>
                  <TableCell className="font-medium">{l.borrowerName}</TableCell>
                  <TableCell>{l.asset?.name || '-'}</TableCell>
                  <TableCell><Badge variant="outline">{l.conditionBefore}</Badge></TableCell>
                  <TableCell>{l.returnDate ? formatDate(l.returnDate) : '-'}</TableCell>
                  <TableCell>{l.conditionAfter ? <Badge variant="outline">{l.conditionAfter}</Badge> : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={l.status === 'BORROWED' ? 'destructive' : 'default'}>
                      {l.status === 'BORROWED' ? 'Dipinjam' : 'Dikembalikan'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {l.status === 'BORROWED' && (
                      <Button size="sm" variant="outline" onClick={() => openReturnDialog(l)}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Kembalikan
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Borrow Dialog */}
      <Dialog open={isBorrowDialogOpen} onOpenChange={setIsBorrowDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Pinjam Barang</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Scan atau Masukkan Kode Aset</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Masukkan kode aset..."
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value)}
                />
                <Button variant="outline" onClick={() => {
                  const scannerDiv = document.getElementById('reader');
                  if (scannerDiv) {
                    // If already open, maybe close? Simple toggle for now
                    scannerDiv.innerHTML = '';
                    const scanner = new Html5QrcodeScanner(
                      "reader",
                      { fps: 10, qrbox: { width: 250, height: 250 } },
                        /* verbose= */ false
                    );
                    scanner.render((decodedText: string) => {
                      setAssetCode(decodedText);
                      // Trigger search automatically
                      const found = assets.find(a => a.code?.toLowerCase() === decodedText.toLowerCase() || a.id === decodedText);
                      if (found) {
                        setSelectedAsset(found);
                        setConditionBefore(found.condition || 'GOOD');
                        toast.success(`Aset ditemukan: ${found.name}`);
                        scanner.clear();
                      } else {
                        toast.error('Aset tidak ditemukan di database.');
                      }
                    }, (error: any) => {
                      // console.warn(error);
                    });
                  }
                }}>
                  <QrCode className="h-4 w-4" /> Scan
                </Button>
              </div>
              <div id="reader" className="w-full"></div>
              {selectedAsset && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  ✓ {selectedAsset.name} ({selectedAsset.code})
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Nama Peminjam</Label>
              <Input
                placeholder="Nama lengkap peminjam"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Kondisi Awal</Label>
              <Select value={conditionBefore} onValueChange={setConditionBefore}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GOOD">Baik</SelectItem>
                  <SelectItem value="BROKEN_LIGHT">Rusak Ringan</SelectItem>
                  <SelectItem value="BROKEN_HEAVY">Rusak Berat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Catatan (Opsional)</Label>
              <Input
                placeholder="Catatan tambahan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBorrowDialogOpen(false)}>Batal</Button>
            <Button onClick={handleBorrow} disabled={submitting || !selectedAsset}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Peminjaman
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Dialog */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Kembalikan Barang</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              Mengembalikan: <strong>{selectedLending?.asset?.name}</strong><br />
              Peminjam: <strong>{selectedLending?.borrowerName}</strong>
            </p>
            <div className="space-y-2">
              <Label>Kondisi Akhir</Label>
              <Select value={conditionAfter} onValueChange={setConditionAfter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GOOD">Baik</SelectItem>
                  <SelectItem value="BROKEN_LIGHT">Rusak Ringan</SelectItem>
                  <SelectItem value="BROKEN_HEAVY">Rusak Berat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)}>Batal</Button>
            <Button onClick={handleReturn} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Konfirmasi Pengembalian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
