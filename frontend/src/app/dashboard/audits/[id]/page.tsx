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
import { useParams } from 'next/navigation';

export default function AuditDetailPage() {
  const { id } = useParams();
  const [audit, setAudit] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api.get(`/audits/${id}`).then(res => setAudit(res.data)).catch(console.error);
    }
  }, [id]);

  if (!audit) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Audit Detail</h1>
        <Badge>{audit.status}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Date</CardTitle></CardHeader>
          <CardContent>{new Date(audit.date).toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Auditor</CardTitle></CardHeader>
          <CardContent>{audit.auditor?.fullName || audit.auditor?.username}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Code</TableHead>
                <TableHead>Asset Name</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audit.items?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.asset.code}</TableCell>
                  <TableCell>{item.asset.name}</TableCell>
                  <TableCell>
                    <Badge variant={item.condition === 'GOOD' ? 'outline' : 'destructive'}>
                      {item.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.note || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
