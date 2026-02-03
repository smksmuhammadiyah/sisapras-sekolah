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
import { useParams } from 'next/navigation';

export default function RoomDetailPage() {
  const { id } = useParams();
  const [room, setRoom] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api.get(`/rooms/${id}`).then(res => setRoom(res.data)).catch(console.error);
    }
  }, [id]);

  if (!room) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{room.name}</h1>
      <p className="text-muted-foreground">{room.type} - {room.location}</p>

      <Card>
        <CardHeader>
          <CardTitle>Assets in Room</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {room.assets?.map((asset: any) => (
                <TableRow key={asset.id}>
                  <TableCell>{asset.code}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>{asset.category}</TableCell>
                </TableRow>
              ))}
              {!room.assets?.length && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">Room is empty.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
