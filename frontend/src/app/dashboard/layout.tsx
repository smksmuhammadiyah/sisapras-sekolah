"use client";

import { useState } from 'react';
import Sidebar from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className={cn("hidden md:block fixed h-full z-50 transition-all duration-300 border-r bg-white dark:bg-slate-950", isCollapsed ? "w-20" : "w-64")}>
        <Sidebar isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      </div>
      <div className={cn("flex-1 flex flex-col min-h-screen transition-all duration-300 bg-slate-50/50 dark:bg-slate-900/50", isCollapsed ? "md:ml-20" : "md:ml-64")}>
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Luxurious Responsive Container */}
          <div className="w-full">
            <div className="mx-auto max-w-[1440px] p-4 sm:p-6 md:p-8 lg:p-12">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
