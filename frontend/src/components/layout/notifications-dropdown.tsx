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

import { useAuth } from '@/context/auth-context';

interface NotificationSummary {
  lowStock: number;
  pendingProcurements: number;
  unapprovedUsers: number;
  activeLendings: number;
  total: number;
}

export function NotificationsDropdown() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [readCounts, setReadCounts] = useState<{
    lowStock: number;
    pendingProcurements: number;
    unapprovedUsers: number;
    activeLendings: number;
  }>({
    lowStock: 0,
    pendingProcurements: 0,
    unapprovedUsers: 0,
    activeLendings: 0
  });

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    // Load read state from local storage
    const stored = localStorage.getItem('notification_read_counts');
    if (stored) {
      try {
        setReadCounts(JSON.parse(stored));
      } catch (e) { console.error(e); }
    }

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

  const handleMarkAsRead = () => {
    if (!summary) return;
    const newReadCounts = {
      lowStock: summary.lowStock,
      pendingProcurements: summary.pendingProcurements,
      unapprovedUsers: summary.unapprovedUsers,
      activeLendings: summary.activeLendings,
    };
    setReadCounts(newReadCounts);
    localStorage.setItem('notification_read_counts', JSON.stringify(newReadCounts));
  };

  // Calculate unread items (simple delta logic)
  const getUnreadCount = (type: 'lowStock' | 'pendingProcurements' | 'unapprovedUsers' | 'activeLendings') => {
    if (!summary) return 0;
    const current = summary[type];
    const read = readCounts[type] || 0;
    if (current < read) return 0;
    return current - read;
  };

  const unreadLowStock = getUnreadCount('lowStock');
  const unreadPending = getUnreadCount('pendingProcurements');
  const unreadUsers = getUnreadCount('unapprovedUsers');
  const unreadLendings = getUnreadCount('activeLendings');

  const totalUnread = unreadLowStock + unreadPending + unreadUsers + unreadLendings;

  // If not admin and no relevant notifications, maybe show nothing or generic message
  // Currently we only have administrative notifications, so non-admins will see "No notifications"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalUnread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {totalUnread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifikasi</DropdownMenuLabel>
          {totalUnread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto text-xs text-primary hover:text-primary/80 p-0"
              onClick={(e) => {
                e.preventDefault();
                handleMarkAsRead();
              }}
            >
              Tandai dibaca
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {/* Helper to check if any content is visible */}
        {(!summary || summary.total === 0) && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Tidak ada notifikasi aktif
          </div>
        )}

        {/* Admin-Only Sections */}
        {isAdmin && summary && (
          <>
            {summary.lowStock > 0 && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/stock" className="flex justify-between cursor-pointer w-full">
                  <span>Stok Menipis</span>
                  <div className="flex items-center gap-2">
                    {unreadLowStock > 0 && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
                    <Badge variant={unreadLowStock > 0 ? "destructive" : "secondary"}>
                      {summary.lowStock}
                    </Badge>
                  </div>
                </Link>
              </DropdownMenuItem>
            )}
            {summary.pendingProcurements > 0 && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/procurement" className="flex justify-between cursor-pointer w-full">
                  <span>Usulan Pending</span>
                  <div className="flex items-center gap-2">
                    {unreadPending > 0 && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
                    <Badge variant={unreadPending > 0 ? "destructive" : "secondary"}>
                      {summary.pendingProcurements}
                    </Badge>
                  </div>
                </Link>
              </DropdownMenuItem>
            )}
            {summary.unapprovedUsers > 0 && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/users" className="flex justify-between cursor-pointer w-full">
                  <span>User Baru Menunggu</span>
                  <div className="flex items-center gap-2">
                    {unreadUsers > 0 && <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>}
                    <Badge variant={unreadUsers > 0 ? "destructive" : "secondary"}>
                      {summary.unapprovedUsers}
                    </Badge>
                  </div>
                </Link>
              </DropdownMenuItem>
            )}
            {summary.activeLendings > 0 && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/lending" className="flex justify-between cursor-pointer w-full">
                  <span>Barang Dipinjam</span>
                  <div className="flex items-center gap-2">
                    {unreadLendings > 0 && <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>}
                    <Badge variant={unreadLendings > 0 ? "destructive" : "secondary"}>
                      {summary.activeLendings}
                    </Badge>
                  </div>
                </Link>
              </DropdownMenuItem>
            )}
          </>
        )}

        {/* Future non-admin notifications can go here */}

        {totalUnread === 0 && summary && summary.total > 0 && (
          <div className="px-2 py-2 text-xs text-center text-muted-foreground bg-muted/20 mt-2">
            Semua notifikasi telah dibaca
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
