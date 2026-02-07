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
import { QrCode, RotateCcw, Plus, Loader2, Check, MoreVertical, Eye, Trash2, X } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useSearchParams } from 'next/navigation';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import dynamic from 'next/dynamic';
import { LendingReportButton } from '@/components/reports/lending-report-button';

const QRScanner = dynamic(() => import('@/components/ui/qr-scanner').then(mod => mod.QRScanner), {
  loading: () => <div className="h-[250px] flex items-center justify-center bg-muted animate-pulse rounded-lg">Memuat Scanner...</div>,
  ssr: false
});

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
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [borrowerName, setBorrowerName] = useState('');
  const [conditionBefore, setConditionBefore] = useState('GOOD');
  const [conditionAfter, setConditionAfter] = useState('GOOD');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchingAsset, setSearchingAsset] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [lendingToDelete, setLendingToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadData();

    // Check for initial assetCode in URL
    const code = searchParams.get('assetCode');
    if (code) {
      setAssetCode(code);
      handleSearchAsset(code);
    }
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

  const openDetailDialog = (lending: any) => {
    setSelectedLending(lending);
    setIsDetailDialogOpen(true);
  };

  const handleSearchAsset = async (codeToSearch: string) => {
    const code = codeToSearch || assetCode;
    if (!code) return;

    setSearchingAsset(true);
    try {
      const res = await api.get('/assets', { params: { search: code, limit: 1 } });
      const found = res.data.items?.[0]; // Backend response is { items, meta }
      if (found && (found.code?.toLowerCase() === code.toLowerCase() || found.id === code)) {
        setSelectedAsset(found);
        setConditionBefore(found.condition || 'GOOD');
        setIsBorrowDialogOpen(true);
        toast.success(`Aset ditemukan: ${found.name}`);
      } else {
        toast.error('Aset tidak ditemukan. Pastikan kode benar.');
      }
    } catch (e) {
      toast.error('Gagal mencari aset');
    } finally {
      setSearchingAsset(false);
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
    setIsScannerOpen(false);
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

  const renderCondition = (condition: string) => {
    switch (condition) {
      case 'GOOD':
        return <Badge className="bg-green-500/10 text-green-600 border-none hover:bg-green-500/20">Baik</Badge>;
      case 'BROKEN_LIGHT':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-none hover:bg-yellow-500/20">Rusak Ringan</Badge>;
      case 'BROKEN_HEAVY':
        return <Badge className="bg-red-500/10 text-red-600 border-none hover:bg-red-500/20">Rusak Berat</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-slate-900 dark:text-slate-100 font-heading">Peminjaman Barang</h1>
          <p className="text-slate-500 mt-1 text-sm leading-relaxed max-w-2xl">Monitor riwayat peminjaman aset sekolah.</p>
        </div>
        <div className="shrink-0 w-full lg:w-auto">
          <div className="flex gap-2 w-full lg:w-auto">
            <Button
              size="sm"
              onClick={() => setIsBorrowDialogOpen(true)}
              className="flex-1 lg:flex-none h-9 rounded-lg px-6 shadow-lg shadow-primary/20 font-bold"
            >
              <Plus className="mr-2 h-4 w-4" /> Pinjam Barang
            </Button>
            <LendingReportButton />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Compact Stats Card */}
        <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <QrCode className="h-5 w-5" />
            </div>
            <div className="text-2xl font-black">{lendings.length}</div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Total Aktivitas</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Riwayat</p>
          </div>
        </Card>

        <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div className="text-2xl font-black text-orange-600">
              {lendings.filter(l => l.status === 'BORROWED' || (l.status === 'LATE')).length}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Sedang Dipinjam</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Beredar</p>
          </div>
        </Card>

        <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
              <Check className="h-5 w-5" />
            </div>
            <div className="text-2xl font-black text-green-600">
              {lendings.filter(l => l.status === 'RETURNED').length}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Sirkulasi Aman</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Selesai</p>
          </div>
        </Card>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Log Peminjaman</h2>
          <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0 border-none">
            {lendings.length} AKTIVITAS
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                <TableHead className="py-3 px-6 text-xs font-bold uppercase tracking-wider">Waktu</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Peminjam</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Aset Barang</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider hidden md:table-cell">Kondisi</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-right pr-6 text-xs font-bold uppercase tracking-wider">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center h-40"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" /></TableCell></TableRow>
              ) : lendings.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center h-40 text-slate-400 italic text-sm">Belum ada sirkulasi peminjaman.</TableCell></TableRow>
              ) : (
                lendings.map((l) => (
                  <TableRow key={l.id} className="group/row transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-slate-100 dark:border-slate-800">
                    <TableCell className="py-3 px-6">
                      <div className="flex flex-col text-[10px] font-bold uppercase text-slate-500">
                        <span>{new Date(l.borrowDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                        <span className="text-primary/60">{new Date(l.borrowDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                          {l.borrowerName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{l.borrowerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{l.asset?.name || '-'}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">{l.asset?.code || '-'}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="scale-75 origin-left">
                        {renderCondition(l.status === 'BORROWED' ? l.conditionAtBorrow : (l.conditionAtReturn || 'GOOD'))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {l.status === 'BORROWED' ? (
                        <Badge className="bg-orange-500/10 text-orange-600 border-none rounded-md px-2 py-0 text-[10px] font-bold">DIPINJAM</Badge>
                      ) : (
                        <Badge className="bg-green-500/10 text-green-600 border-none rounded-md px-2 py-0 text-[10px] font-bold">KEMBALI</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                        {l.status === 'BORROWED' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openReturnDialog(l)}
                            className="h-8 w-8 rounded-md hover:bg-white text-primary"
                            title="Kembalikan"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => openDetailDialog(l)} className="h-8 w-8 rounded-md">
                          <Eye className="h-4 w-4 text-slate-400" />
                        </Button>
                        {user?.role === 'ADMIN' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-destructive" onClick={() => { setLendingToDelete(l.id); setIsDeleteDialogOpen(true); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Borrow Dialog */}
      < Dialog open={isBorrowDialogOpen} onOpenChange={setIsBorrowDialogOpen} >
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchAsset(assetCode);
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => setIsScannerOpen(!isScannerOpen)}
                  className={isScannerOpen ? "bg-primary/10 text-primary border-primary/20" : ""}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  {isScannerOpen ? "Tutup" : "Scan"}
                </Button>
                <Button variant="secondary" onClick={() => handleSearchAsset(assetCode)} disabled={searchingAsset}>
                  {searchingAsset ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cari"}
                </Button>
              </div>

              {isScannerOpen && (
                <div className="mt-4 border rounded-lg overflow-hidden relative group">
                  <QRScanner
                    onScan={(code) => {
                      setAssetCode(code);
                      handleSearchAsset(code);
                    }}
                    onClose={() => setIsScannerOpen(false)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 bg-background/50 backdrop-blur"
                    onClick={() => setIsScannerOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {selectedAsset && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded animate-in fade-in slide-in-from-top-1">
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
      </Dialog >

      {/* Return Dialog */}
      < Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen} >
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
      </Dialog >
      {/* Detail Dialog */}
      < Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen} >
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
      </Dialog >
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
