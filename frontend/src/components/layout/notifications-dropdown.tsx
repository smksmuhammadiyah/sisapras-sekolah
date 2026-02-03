"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

interface NotificationSummary {
  lowStock: number;
  pendingProcurements: number;
  total: number;
}

export function NotificationsDropdown() {
  const [summary, setSummary] = useState<NotificationSummary | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications/summary');
        setSummary(res.data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute

    return () => clearInterval(interval);
  }, []);

  const hasNotifications = summary && summary.total > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {summary.total}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!hasNotifications && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Tidak ada notifikasi baru
          </div>
        )}
        {summary && summary.lowStock > 0 && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard/stock" className="flex justify-between cursor-pointer">
              <span>Stok Menipis</span>
              <Badge variant="destructive">{summary.lowStock}</Badge>
            </Link>
          </DropdownMenuItem>
        )}
        {summary && summary.pendingProcurements > 0 && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard/procurement" className="flex justify-between cursor-pointer">
              <span>Usulan Pending</span>
              <Badge variant="secondary">{summary.pendingProcurements}</Badge>
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
