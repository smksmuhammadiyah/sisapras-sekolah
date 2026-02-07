"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Box,
  Home,
  ClipboardList,
  Wrench,
  Package,
  ShoppingCart,
  LogOut,
  User,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Users,
  Building2
} from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';

// ... imports are fine at top ...

// ... imports at top

export default function Sidebar({
  isCollapsed,
  toggleCollapse,
  isMobile,
  onLinkClick
}: {
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  isMobile?: boolean;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  const links: { href: string; label: string; icon: any }[] = [];

  if (user.role === 'ADMIN') {
    links.push(
      { href: '/dashboard/admin', label: 'Beranda', icon: LayoutDashboard },
      { href: '/dashboard/assets', label: 'Data Aset', icon: Box },
      { href: '/dashboard/rooms', label: 'Data Ruangan', icon: Home },
      { href: '/dashboard/audits', label: 'Audit / Opname', icon: ClipboardList },
      { href: '/dashboard/stock', label: 'Stok Habis Pakai', icon: Package },
      { href: '/dashboard/procurement', label: 'E-Usulan', icon: ShoppingCart },
      { href: '/dashboard/services', label: 'Riwayat Servis', icon: Wrench },
      { href: '/dashboard/lending', label: 'Peminjaman Barang', icon: Package },
      { href: '/dashboard/users', label: 'Manajemen User', icon: Users },
      { href: '/dashboard/settings', label: 'Pengaturan Sekolah', icon: Building2 },
      { href: '/dashboard/settings/reports', label: 'Kop Surat Laporan', icon: FileText },
      { href: '/dashboard/admin/trash', label: 'Tong Sampah', icon: Trash2 },
    );
  } else if (user.role === 'STAFF') {
    links.push(
      { href: '/dashboard/staff', label: 'Beranda', icon: LayoutDashboard },
      { href: '/dashboard/audits', label: 'Audit Tugas Saya', icon: ClipboardList },
      { href: '/dashboard/procurement', label: 'E-Usulan / Pengadaan', icon: ShoppingCart },
      { href: '/dashboard/services', label: 'Perbaikan Aset', icon: Wrench },
      { href: '/dashboard/lending', label: 'Peminjaman Barang', icon: Package },
    );
  } else if (user.role === 'USER') {
    links.push(
      { href: '/dashboard/user', label: 'Beranda', icon: LayoutDashboard },
      { href: '/dashboard/procurement', label: 'Usulan Saya', icon: ShoppingCart },
      { href: '/dashboard/stock', label: 'Cek Stok', icon: Package },
      { href: '/dashboard/lending', label: 'Pinjam Barang', icon: Package },
    );
  } else if (user.role === 'SISWA') {
    links.push(
      { href: '/dashboard/user', label: 'Beranda', icon: LayoutDashboard },
      { href: '/dashboard/lending', label: 'Pinjam Barang', icon: Package },
    );
  }

  // Helper for Role Display Name
  const getRoleName = (role: string) => ROLE_LABELS[role] || role;

  return (
    <div className={cn("flex h-full w-full flex-col bg-muted/40 transition-all duration-300", isCollapsed && !isMobile ? "items-center" : "")}>
      <div className={cn("flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6", isCollapsed && !isMobile ? "justify-center px-0" : "")}>
        <Link href={user.role === 'ADMIN' ? '/dashboard/admin' : user.role === 'STAFF' ? '/dashboard/staff' : '/dashboard/user'} className="flex items-center gap-2 font-semibold">
          <Box className="h-6 w-6" />
          {(!isCollapsed || isMobile) && <span className="">SIM-SAPRAS</span>}
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2 w-full">
        <nav className={cn("grid items-start px-2 text-sm font-medium lg:px-4", isCollapsed && !isMobile ? "px-2" : "")}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                pathname === link.href ? "bg-muted text-primary" : "text-muted-foreground",
                isCollapsed && !isMobile ? "justify-center px-2" : ""
              )}
              title={isCollapsed && !isMobile ? link.label : undefined}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {(!isCollapsed || isMobile) && link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t bg-background/50 backdrop-blur-sm w-full">
        <div className={cn("flex items-center gap-3 mb-4 px-2", isCollapsed && !isMobile ? "justify-center" : "")}>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-4 w-4" />
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium capitalize truncate">{user.username}</p>
              <p className="text-xs text-muted-foreground truncate">{getRoleName(user.role)}</p>
            </div>
          )}
        </div>

        <div className="grid gap-2">
          {/* Desktop Collapse Toggle */}
          {!isMobile && toggleCollapse && (
            <Button variant="ghost" size="sm" className={cn("w-full text-muted-foreground hover:text-foreground mb-2", isCollapsed ? "justify-center" : "justify-between px-2")} onClick={toggleCollapse}>
              {(!isCollapsed) && <span className="text-xs">Perkecil Sidebar</span>}
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}

          {(!isCollapsed || isMobile) && (
            <>
              <Button variant="ghost" className="w-full justify-start gap-2 h-8 px-2" asChild>
                <Link href="/dashboard/profile" onClick={onLinkClick}>
                  <Settings className="h-4 w-4" /> Pengaturan
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 box-border" onClick={() => setIsLogoutOpen(true)}>
                <LogOut className="h-4 w-4" />
                Keluar
              </Button>
            </>
          )}
          {(isCollapsed && !isMobile) && (
            <Button variant="ghost" size="icon" onClick={() => setIsLogoutOpen(true)} title="Keluar" className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Konfirmasi Keluar</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">Apakah Anda yakin ingin keluar dari aplikasi?</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsLogoutOpen(false)} variant="outline">Batal</Button>
            <Button onClick={logout} variant="destructive">Ya, Keluar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
