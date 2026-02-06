"use client";

import { useEffect, useState, Suspense } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { QrCode, RotateCcw, Plus, Loader2, Check, MoreVertical, Eye, Trash2 } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '@/context/auth-context';
import { useSearchParams } from 'next/navigation';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';

export default function LendingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Memuat halaman peminjaman...</div>}>
      <LendingContent />
    </Suspense>
  );
}

function LendingContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [lendingToDelete, setLendingToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
    loadAssets();
  }, []);

  const openDetailDialog = (lending: any) => {
    setSelectedLending(lending);
    setIsDetailDialogOpen(true);
  };

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

      // Auto-open borrow dialog if assetCode is in URL
      const code = searchParams.get('assetCode');
      if (code) {
        setAssetCode(code);
        const found = res.data.find((a: any) => a.code?.toLowerCase() === code.toLowerCase() || a.id === code);
        if (found) {
          setSelectedAsset(found);
          setConditionBefore(found.condition || 'GOOD');
          setIsBorrowDialogOpen(true);
          toast.success(`Aset ditemukan: ${found.name}`);
        }
      }
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

  const handleDelete = async () => {
    if (!lendingToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/lending/${lendingToDelete}`);
      toast.success('Riwayat berhasil dihapus');
      loadData();
      setIsDeleteDialogOpen(false);
      setLendingToDelete(null);
    } catch (e) {
      toast.error('Gagal menghapus');
    } finally {
      setIsDeleting(false);
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
    setBorrowerName(user?.fullName || user?.username || '');
    setConditionBefore('GOOD');
    setNotes('');
  };

  // Pre-fill borrower name when dialog opens
  useEffect(() => {
    if (isBorrowDialogOpen && !borrowerName) {
      setBorrowerName(user?.fullName || user?.username || '');
    }
  }, [isBorrowDialogOpen, user, borrowerName]);

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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Peminjaman Barang</h1>
          <p className="text-muted-foreground">Monitor dan kelola riwayat peminjaman aset sekolah.</p>
        </div>
        <Button
          onClick={() => setIsBorrowDialogOpen(true)}
          className="rounded-full px-6 shadow-lg shadow-primary/20 hover:scale-105 transition-all duration-300"
        >
          <Plus className="mr-2 h-4 w-4" /> Pinjam Barang
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between pb-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                <QrCode className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold">{lendings.length}</div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">Total Peminjaman</p>
              <p className="text-xs text-muted-foreground/60">Seluruh riwayat transaksi</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between pb-2">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold text-orange-600">{lendings.filter(l => l.status === 'BORROWED').length}</div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">Sedang Dipinjam</p>
              <p className="text-xs text-muted-foreground/60">Aset belum kembali</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between pb-2">
              <div className="p-2 rounded-xl bg-green-500/10 text-green-600">
                <Check className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold text-green-600">{lendings.filter(l => l.status === 'RETURNED').length}</div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">Sudah Dikembalikan</p>
              <p className="text-xs text-muted-foreground/60">Transaksi selesai</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-none shadow-xl bg-card/30 backdrop-blur-md overflow-hidden">
        <CardHeader className="bg-muted/30 pb-6 border-b border-muted/20">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold">Riwayat Peminjaman</CardTitle>
              <CardDescription>Menampilkan daftar aktivitas penggunaan aset</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="hover:bg-transparent border-b border-muted">
                  <TableHead className="py-4 pl-6 text-xs font-bold uppercase tracking-wider">Tanggal & Waktu</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider">Peminjam</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider">Aset Barang</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider">Kondisi</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-right pr-6 text-xs font-bold uppercase tracking-wider">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center h-48"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : lendings.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center h-48 text-muted-foreground italic">Belum ada data peminjaman.</TableCell></TableRow>
                ) : (
                  lendings.map((l) => (
                    <TableRow key={l.id} className="group hover:bg-muted/30 transition-colors duration-200">
                      <TableCell className="py-4 pl-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{new Date(l.borrowDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(l.borrowDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-bold border border-primary/20">
                            {l.borrowerName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium">{l.borrowerName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{l.asset?.name || '-'}</span>
                          <span className="text-[10px] text-muted-foreground">CODE: {l.asset?.code || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 grayscale opacity-70 scale-90 origin-left">
                            <span className="text-[8px] font-bold text-muted-foreground">AWAL:</span>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0">{l.conditionBefore}</Badge>
                          </div>
                          {l.conditionAfter && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] font-bold text-muted-foreground uppercase">AKHIR:</span>
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary text-primary">{l.conditionAfter}</Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {l.status === 'BORROWED' ? (
                          <div className="flex items-center px-2 py-1 bg-orange-500/10 text-orange-600 rounded-full w-fit gap-1.5 border border-orange-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-600 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Dipinjam</span>
                          </div>
                        ) : (
                          <div className="flex items-center px-2 py-1 bg-green-500/10 text-green-600 rounded-full w-fit gap-1.5 border border-green-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Kembali</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          {l.status === 'BORROWED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openReturnDialog(l)}
                              className="h-8 rounded-lg text-primary hover:bg-primary/10 border border-primary/20"
                            >
                              <RotateCcw className="mr-2 h-3.5 w-3.5" />
                              <span className="text-xs uppercase font-bold text-nowrap">Kembali</span>
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Buka menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onSelect={() => openDetailDialog(l)}
                              >
                                <Eye className="mr-2 h-4 w-4" /> Detail Peminjaman
                              </DropdownMenuItem>
                              {user?.role === 'ADMIN' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive cursor-pointer"
                                    onSelect={() => {
                                      setLendingToDelete(l.id);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Hapus Data
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md border-none shadow-2xl bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Eye className="h-5 w-5 text-primary" /> Detail Transaksi
            </DialogTitle>
          </DialogHeader>
          {selectedLending && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Aset Barang</span>
                  <p className="font-semibold text-sm">{selectedLending.asset?.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedLending.asset?.code}</p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</span>
                  <div>
                    <Badge variant={selectedLending.status === 'BORROWED' ? 'destructive' : 'default'} className="text-[10px]">
                      {selectedLending.status === 'BORROWED' ? 'Sedang Dipinjam' : 'Sudah Kembali'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-muted/50 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Peminjam:</span>
                  <span className="font-bold">{selectedLending.borrowerName}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Waktu Pinjam:</span>
                  <span>{formatDate(selectedLending.borrowDate)}</span>
                </div>
                {selectedLending.returnDate && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Waktu Kembali:</span>
                    <span className="text-primary font-medium">{formatDate(selectedLending.returnDate)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center block">Kondisi Fisik</span>
                <div className="flex justify-around items-center p-3 rounded-xl border border-dashed">
                  <div className="text-center">
                    <span className="text-[8px] text-muted-foreground block mb-1">AWAL</span>
                    <Badge variant="outline" className="font-bold">{selectedLending.conditionBefore}</Badge>
                  </div>
                  <div className="h-8 w-px bg-muted mx-2" />
                  <div className="text-center">
                    <span className="text-[8px] text-muted-foreground block mb-1">AKHIR</span>
                    <Badge variant={selectedLending.conditionAfter ? "default" : "outline"} className="font-bold">
                      {selectedLending.conditionAfter || '-'}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedLending.notes && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Catatan</span>
                  <p className="text-xs p-3 rounded-lg bg-orange-50/50 border border-orange-100 text-orange-800 italic">
                    "{selectedLending.notes}"
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailDialogOpen(false)} className="w-full rounded-xl">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Hapus Riwayat Peminjaman?"
        description="Apakah Anda yakin ingin menghapus riwayat peminjaman ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}
