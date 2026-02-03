"use client";

import { usePathname } from 'next/navigation';
import { NotificationsDropdown } from './notifications-dropdown';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Sidebar from '@/components/layout/sidebar';

export function Header() {
  const pathname = usePathname();

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
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-b px-6 py-3 flex items-center justify-between h-16">
      <div className="font-semibold text-lg text-slate-800 dark:text-slate-200">
        {/* We can show breadcrumbs here later */}
        {/* For now, maybe just generic branding or nothing if each page has H1 */}
        {/* Actually most pages have their own H1. Let's keep this clean or maybe just User greeting? */}
        {/* Let's show current section name for context since we might scroll */}
        <span className="hidden md:inline-block text-muted-foreground font-normal">SIM-SAPRAS &nbsp;/&nbsp; </span> {getTitle()}
      </div>

      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <div className="md:hidden mr-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <Sidebar isMobile onLinkClick={() => {
                // We can't easily close specific sheet from here without controlled state, 
                // but clicking a link will navigate and usually close via re-render or we can let user close.
                // Ideally we use a wrapper to close. For now, let's just show it.
              }} />
            </SheetContent>
          </Sheet>
        </div>
        <NotificationsDropdown />
      </div>
    </header>
  );
}
