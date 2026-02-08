"use client";

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NotificationsDropdown } from './notifications-dropdown';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import Sidebar from '@/components/layout/sidebar';

export function Header() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Helper to format pathname into title
  const getTitle = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length <= 1) return 'Dashboard';

    // Custom mapping or simple capitalization
    // e.g. /dashboard/stock -> Stok
    const lastPart = parts[parts.length - 1];

    // Check if it's an ID
    if (lastPart.match(/^[0-9a-fA-F-]{10,}$/)) return 'Detail';
    if (lastPart === 'new') return 'Baru';
    if (lastPart === 'edit') return 'Edit';

    const segment = parts[1]; // dashboard / [segment]
    if (segment === 'stock') return 'Inventaris Stok';
    if (segment === 'assets') return 'Manajemen Aset';
    if (segment === 'rooms') return 'Manajemen Ruangan';
    if (segment === 'procurement') return 'Pengadaan';
    if (segment === 'audits') return 'Audit';
    if (segment === 'services') return 'Servis & Perbaikan';
    if (segment === 'users') return 'Manajemen User';
    if (segment === 'reports') return 'Laporan';

    return 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 px-4 sm:px-8 backdrop-blur-xl">
      <div className="font-semibold text-base sm:text-lg text-slate-800 dark:text-slate-200 truncate pr-4">
        <span className="hidden sm:inline-block text-muted-foreground font-normal">SIM-SAPRAS &nbsp;/&nbsp; </span> {getTitle()}
      </div>

      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <div className="md:hidden mr-2">
          <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
              <SheetDescription className="sr-only">
                Menu navigasi utama untuk akses ke berbagai fitur aplikasi.
              </SheetDescription>
              <Sidebar
                isMobile
                onLinkClick={() => setIsDrawerOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
        <NotificationsDropdown />
      </div>
    </header>
  );
}
