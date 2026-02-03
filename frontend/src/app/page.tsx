"use client";

import { HeroSection } from '@/components/landing/hero';
import { ContextSection, SolutionSection } from '@/components/landing/story-sections';
import { VisualStorySection } from '@/components/landing/visual-story';
import { RoleBasedSection } from '@/components/landing/role-tabs';
import { FlowSection, TrustSection, CTAEmotionalSection } from '@/components/landing/interactive-sections';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 selection:bg-cyan-500/30 text-slate-100 font-sans">
      <header className="fixed top-0 w-full z-50 backdrop-blur-sm border-b border-white/10 bg-slate-950/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl text-white tracking-tight">SIM-SAPRAS</div>
          <nav className="flex gap-6 text-sm font-medium">
            <Link href="#features" className="hover:text-cyan-400 transition-colors">Cara Kerja</Link>
            <Link href="/login" className="hover:text-cyan-400 transition-colors">Masuk</Link>
          </nav>
        </div>
      </header>

      <HeroSection />
      <ContextSection />
      <SolutionSection />
      <VisualStorySection />
      <RoleBasedSection />
      <FlowSection />
      <TrustSection />
      <CTAEmotionalSection />

      <footer className="py-12 bg-slate-950 border-t border-slate-900">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-sm">
            <p className="font-semibold text-slate-400 mb-1">SIM-SAPRAS</p>
            <p>Sistem Informasi Manajemen Sarana Prasarana Sekolah</p>
          </div>
          <nav className="flex gap-6 text-slate-500 text-sm">
            <Link href="#features" className="hover:text-cyan-400 transition-colors">Tentang Sistem</Link>
            <Link href="#" className="hover:text-cyan-400 transition-colors" title="Dokumentasi akan segera tersedia">Dokumentasi</Link>
            <Link href="mailto:admin@sekolah.id" className="hover:text-cyan-400 transition-colors">Kontak</Link>
          </nav>
          <div className="text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
