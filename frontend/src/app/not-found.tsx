import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 font-sans">
      <div className="text-center space-y-6 max-w-md">
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
          <FileQuestion className="h-32 w-32 text-blue-600 dark:text-blue-400 relative z-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold font-heading text-blue-600 dark:text-blue-400">404</h1>
          <h2 className="text-2xl font-semibold">Halaman Tidak Ditemukan</h2>
          <p className="text-muted-foreground">
            Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
          </p>
        </div>

        <div className="pt-4">
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-12 px-8 rounded-full shadow-lg shadow-blue-500/20 transition-all hover:scale-105">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
