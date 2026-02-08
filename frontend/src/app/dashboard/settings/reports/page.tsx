"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Loader2, Upload, Save } from 'lucide-react';

interface ReportSettings {
  leftLogoUrl?: string | null;
  rightLogoUrl?: string | null;
  schoolName: string;
  branchName: string;
  mainTitle: string;
  address: string;
  contactInfo: string;
}

export default function ReportSettingsPage() {
  const [settings, setSettings] = useState<ReportSettings>({
    schoolName: '',
    branchName: '',
    mainTitle: '',
    address: '',
    contactInfo: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings/report');
      setSettings(res.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Gagal memuat pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file: File, position: 'left' | 'right') => {
    if (!file) return;

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      toast.error('Ukuran file maksimal 500KB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;

      try {
        const fieldName = position === 'left' ? 'leftLogoUrl' : 'rightLogoUrl';
        await api.patch('/settings/report', { [fieldName]: base64 });
        setSettings((prev) => ({ ...prev, [fieldName]: base64 }));
        toast.success(`Logo ${position === 'left' ? 'kiri' : 'kanan'} berhasil diupload`);
      } catch (error) {
        console.error('Error uploading logo:', error);
        toast.error('Gagal upload logo');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/settings/report', settings);
      toast.success('Pengaturan berhasil disimpan');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-2 px-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-heading truncate">Pengaturan Laporan</h1>
        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Konfigurasi kop surat untuk laporan resmi sistem.</p>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
        <CardHeader className="border-b border-slate-50 dark:border-slate-900/50 bg-slate-50/30 dark:bg-slate-900/10">
          <CardTitle className="text-lg font-bold">Logo Sekolah</CardTitle>
          <CardDescription className="text-xs">Upload logo untuk kop surat (maks. 500KB, format PNG/JPG)</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left Logo */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Logo Kiri (Muhammadiyah)</Label>
              <div className="space-y-4">
                {settings.leftLogoUrl && (
                  <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-center">
                    <img src={settings.leftLogoUrl} alt="Logo Kiri" className="h-20 w-20 object-contain" />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="h-10 rounded-lg text-xs file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file, 'left');
                  }}
                />
              </div>
            </div>

            {/* Right Logo */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Logo Kanan (Sekolah)</Label>
              <div className="space-y-4">
                {settings.rightLogoUrl && (
                  <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-center">
                    <img src={settings.rightLogoUrl} alt="Logo Kanan" className="h-20 w-20 object-contain" />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="h-10 rounded-lg text-xs file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file, 'right');
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
        <CardHeader className="border-b border-slate-50 dark:border-slate-900/50 bg-slate-50/30 dark:bg-slate-900/10">
          <CardTitle className="text-lg font-bold">Informasi Sekolah</CardTitle>
          <CardDescription className="text-xs">Data yang akan ditampilkan di kop surat laporan</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Judul Utama / Organisasi</Label>
            <Input
              value={settings.mainTitle}
              className="h-10 rounded-lg focus:ring-primary/20"
              onChange={(e) => setSettings({ ...settings, mainTitle: e.target.value })}
              placeholder="PIMPINAN CABANG MUHAMMADIYAH SATUI"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Nama Cabang / Majelis</Label>
            <Input
              value={settings.branchName}
              className="h-10 rounded-lg focus:ring-primary/20"
              onChange={(e) => setSettings({ ...settings, branchName: e.target.value })}
              placeholder="MAJELIS PENDIDIKAN DASAR DAN MENENGAH"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Nama Instansi / Sekolah</Label>
            <Input
              value={settings.schoolName}
              className="h-10 rounded-lg focus:ring-primary/20 font-bold"
              onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
              placeholder="SMKS MUHAMMADIYAH SATUI"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Alamat Lengkap</Label>
            <Input
              value={settings.address}
              className="h-10 rounded-lg focus:ring-primary/20"
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="Jl. KH. Ahmad Dahlan, No.07 Ds. Makmur Jaya..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Informasi Kontak / Legalitas</Label>
            <Input
              value={settings.contactInfo}
              className="h-10 rounded-lg focus:ring-primary/20"
              onChange={(e) => setSettings({ ...settings, contactInfo: e.target.value })}
              placeholder="NSPN : 69772942 NISS : 322155110007..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl p-4 text-[11px] text-blue-800 dark:text-blue-200 shadow-sm">
        <p className="font-black uppercase tracking-widest flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          Info Penting
        </p>
        <p className="mt-2 leading-relaxed">
          Nama <strong>Kepala Sekolah</strong> dan <strong>Wakasek Sarpras</strong> diambil secara dinamis dari{' '}
          <a href="/dashboard/settings" className="underline font-bold text-blue-600 dark:text-blue-400">Pengaturan Identitas</a>.
          Nama tersebut akan otomatis muncul pada bagian tanda tangan laporan PDF.
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving} size="sm" className="h-10 px-8 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 gap-2 w-full sm:w-auto">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Simpan Pengaturan Laporan
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
