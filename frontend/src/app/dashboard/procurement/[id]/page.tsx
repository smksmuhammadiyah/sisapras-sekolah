"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

export default function ProcurementDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [procurement, setProcurement] = useState<any>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = () => {
    api.get(`/procurements/${id}`).then(res => setProcurement(res.data)).catch(console.error);
  };

  const handleApprove = async () => {
    try {
      await api.patch(`/procurements/${id}/approve`);
      toast.success("Proposal Disetujui");
      setIsApproveOpen(false);
      loadData();
    } catch (e) {
      toast.error("Gagal menyetujui proposal");
    }
  };

  const handleReject = async () => {
    if (!rejectReason) return;
    try {
      await api.patch(`/procurements/${id}/reject`, { reason: rejectReason });
      toast.success("Proposal Ditolak");
      setIsRejectOpen(false);
      loadData();
    } catch (e) {
      toast.error("Gagal menolak proposal");
    }
  };

  if (!procurement) return <div>Loading...</div>;

  const isKaprog = user?.role === 'KAPROG';
  const canApprove =
    (isKaprog && procurement.status === 'PENDING') ||
    (isAdmin && (procurement.status === 'PENDING' || procurement.status === 'REVIEW_WAKASEK'));
  const approveLabel = isAdmin ? "Setujui Final" : "Review & Teruskan";

  // Helper for friendly status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Menunggu Review Kaprog';
      case 'REVIEW_WAKASEK': return 'Menunggu Review Wakasek';
      case 'APPROVED': return 'Disetujui';
      case 'REJECTED': return 'Ditolak';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{procurement.title}</h1>
        <div className="flex gap-2 items-center">
          <Badge variant={procurement.priority === 'HIGH' ? 'destructive' : 'secondary'}>{procurement.priority}</Badge>
          <Badge variant={procurement.status === 'APPROVED' ? 'default' : procurement.status === 'REJECTED' ? 'destructive' : 'outline'}>
            {getStatusLabel(procurement.status)}
          </Badge>
          {procurement.updatedAt && (
            <Badge variant="outline" className="text-muted-foreground">
              Updated: {new Date(procurement.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Badge>
          )}
        </div>
      </div>

      {procurement.status === 'REJECTED' && (
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          <span className="font-bold">Alasan Penolakan:</span> {procurement.rejectionReason}
        </div>
      )}

      {/* ... Cards ... */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Requester</CardTitle></CardHeader>
          <CardContent>{procurement.requester?.fullName || procurement.requester?.username}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Budget</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(procurement.totalBudget)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Spec</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Est. Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {procurement.items?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.spec}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.priceEst)}</TableCell>
                  <TableCell>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.totalEst)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {canApprove && (
        <div className="flex justify-end gap-4 border-t pt-6">
          <Button variant="destructive" onClick={() => setIsRejectOpen(true)}>Tolak</Button>
          <Button onClick={() => setIsApproveOpen(true)} className="bg-green-600 hover:bg-green-700">
            {approveLabel}
          </Button>
        </div>
      )}

      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tolak Proposal</DialogTitle></DialogHeader>
          <div className="py-4">
            <Label>Alasan penolakan</Label>
            <Input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Contoh: Anggaran tidak mencukupi" />
          </div>
          <DialogFooter>
            <Button onClick={handleReject} variant="destructive">Konfirmasi Tolak</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Setujui Proposal</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">Apakah Anda yakin ingin menyetujui proposal pengadaan ini? Total anggaran akan dicatat.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsApproveOpen(false)} variant="outline">Batal</Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">Ya, Setujui</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
