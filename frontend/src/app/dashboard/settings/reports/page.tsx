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
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Pengaturan Laporan</h1>
        <p className="text-slate-500 mt-1">Konfigurasi kop surat untuk laporan PDF</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logo Sekolah</CardTitle>
          <CardDescription>Upload logo untuk kop surat (maks. 500KB, format PNG/JPG)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Logo */}
            <div className="space-y-2">
              <Label>Logo Kiri</Label>
              <div className="space-y-3">
                {settings.leftLogoUrl && (
                  <div className="border rounded-lg p-4 bg-slate-50">
                    <img src={settings.leftLogoUrl} alt="Logo Kiri" className="h-20 w-20 object-contain mx-auto" />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file, 'left');
                  }}
                />
              </div>
            </div>

            {/* Right Logo */}
            <div className="space-y-2">
              <Label>Logo Kanan</Label>
              <div className="space-y-3">
                {settings.rightLogoUrl && (
                  <div className="border rounded-lg p-4 bg-slate-50">
                    <img src={settings.rightLogoUrl} alt="Logo Kanan" className="h-20 w-20 object-contain mx-auto" />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
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

      <Card>
        <CardHeader>
          <CardTitle>Informasi Sekolah</CardTitle>
          <CardDescription>Data yang akan ditampilkan di kop surat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Judul Utama</Label>
            <Input
              value={settings.mainTitle}
              onChange={(e) => setSettings({ ...settings, mainTitle: e.target.value })}
              placeholder="PIMPINAN CABANG MUHAMMADIYAH SATUI"
            />
          </div>

          <div className="space-y-2">
            <Label>Nama Cabang/Majelis</Label>
            <Input
              value={settings.branchName}
              onChange={(e) => setSettings({ ...settings, branchName: e.target.value })}
              placeholder="MAJELIS PENDIDIKAN DASAR DAN MENENGAH"
            />
          </div>

          <div className="space-y-2">
            <Label>Nama Sekolah</Label>
            <Input
              value={settings.schoolName}
              onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
              placeholder="SMKS MUHAMMADIYAH SATUI"
            />
          </div>

          <div className="space-y-2">
            <Label>Alamat</Label>
            <Input
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="Jl. KH. Ahmad Dahlan, No.07 Ds. Makmur Jaya..."
            />
          </div>

          <div className="space-y-2">
            <Label>Kontak Info</Label>
            <Input
              value={settings.contactInfo}
              onChange={(e) => setSettings({ ...settings, contactInfo: e.target.value })}
              placeholder="NSPN, NISS, Telp, Email..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium">💡 Info Penting:</p>
        <p className="mt-1">
          Nama <strong>Kepala Sekolah</strong> dan <strong>Wakasek Sarpas</strong> diambil dari{' '}
          <a href="/dashboard/settings" className="underline font-medium">Pengaturan Sekolah</a>.
          Silakan edit di halaman tersebut jika perlu mengubah nama penandatangan.
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Simpan Pengaturan
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
