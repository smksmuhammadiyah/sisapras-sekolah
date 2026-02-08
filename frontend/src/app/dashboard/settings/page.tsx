"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Save, School, MapPin, Phone, Mail, Globe, User, Database, Download, Upload, AlertTriangle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { RoleGuard } from "@/components/auth/role-guard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AcademicYearsSettings } from "@/components/dashboard/settings/academic-years"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const settingsSchema = z.object({
  name: z.string().min(1, "Nama sekolah wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  phone: z.string().min(1, "Telepon wajib diisi"),
  email: z.string().email("Email tidak valid"),
  website: z.string().optional().or(z.literal("")),
  headmaster: z.string().min(1, "Nama Kepala Sekolah wajib diisi"),
  nipHeadmaster: z.string().min(1, "NIP Kepala Sekolah wajib diisi"),
  sarprasName: z.string().min(1, "Nama Wakasek Sarpras wajib diisi"),
  nipSarpras: z.string().min(1, "NIP Wakasek Sarpras wajib diisi"),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema)
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/settings`)
        const data = res.data
        if (data) {
          setValue("name", data.name)
          setValue("address", data.address)
          setValue("phone", data.phone)
          setValue("email", data.email)
          setValue("website", data.website || "")
          setValue("headmaster", data.headmaster)
          setValue("nipHeadmaster", data.nipHeadmaster)
          setValue("sarprasName", data.sarprasName)
          setValue("nipSarpras", data.nipSarpras)
        }
      } catch (error) {
        toast.error("Gagal memuat pengaturan")
      } finally {
        setIsFetching(false)
      }
    }
    fetchSettings()
  }, [setValue])

  const onSubmit = async (data: SettingsFormValues) => {
    setIsLoading(true)
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/settings`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      toast.success("Pengaturan berhasil disimpan")
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackup = async () => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/settings/backup`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${new Date().toISOString().split('T')[0]}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Cadangan berhasil diunduh");
    } catch (error) {
      toast.error("Gagal membuat cadangan");
    }
  }

  const [restoreFile, setRestoreFile] = useState<File | null>(null)
  const [isRestoreAlertOpen, setIsRestoreAlertOpen] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  const handleRestore = async () => {
    if (!restoreFile) return;
    setIsRestoring(true);
    const formData = new FormData();
    formData.append('file', restoreFile);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/settings/restore`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success("Database berhasil dipulihkan");
      setRestoreFile(null);
    } catch (error) {
      toast.error("Gagal memulihkan database");
    } finally {
      setIsRestoring(false);
      setIsRestoreAlertOpen(false);
    }
  }

  if (isFetching) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="space-y-12 font-sans">
        <div className="flex flex-col gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-heading truncate">Pengaturan Sekolah</h1>
            <p className="text-slate-500 mt-1 text-xs sm:text-sm leading-relaxed max-w-2xl">Kelola informasi sekolah dan konfigurasi sistem.</p>
          </div>

          <Tabs defaultValue="identity" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-[600px] h-11 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              <TabsTrigger value="identity" className="rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider">Identitas</TabsTrigger>
              <TabsTrigger value="academic" className="rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider">Akademik</TabsTrigger>
              <TabsTrigger value="maintenance" className="rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider">Sistem</TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-6 pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-950">
                  <CardHeader className="border-b border-slate-50 dark:border-slate-900/50 bg-slate-50/30 dark:bg-slate-900/10">
                    <CardTitle className="text-lg font-bold">Identitas Sekolah</CardTitle>
                    <CardDescription className="text-xs">Informasi dasar sekolah untuk KOP Surat</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Nama Sekolah</Label>
                        <div className="relative">
                          <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input id="name" className="pl-10 h-10 rounded-lg bg-white dark:bg-slate-950 focus:ring-primary/20" {...register("name")} />
                        </div>
                        {errors.name && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.name.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-500">Telepon</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input id="phone" className="pl-10 h-10 rounded-lg bg-white dark:bg-slate-950 focus:ring-primary/20" {...register("phone")} />
                        </div>
                        {errors.phone && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.phone.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-slate-500">Alamat Lengkap</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input id="address" className="pl-10 h-10 rounded-lg bg-white dark:bg-slate-950 focus:ring-primary/20" {...register("address")} />
                      </div>
                      {errors.address && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.address.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input id="email" className="pl-10 h-10 rounded-lg bg-white dark:bg-slate-950 focus:ring-primary/20" {...register("email")} />
                        </div>
                        {errors.email && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.email.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-xs font-bold uppercase tracking-wider text-slate-500">Website (Opsional)</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input id="website" className="pl-10 h-10 rounded-lg bg-white dark:bg-slate-950 focus:ring-primary/20" {...register("website")} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-950">
                  <CardHeader className="border-b border-slate-50 dark:border-slate-900/50 bg-slate-50/30 dark:bg-slate-900/10">
                    <CardTitle className="text-lg font-bold">Pejabat Penandatangan</CardTitle>
                    <CardDescription className="text-xs">Data pejabat untuk tanda tangan laporan resmi</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 space-y-8">
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                          <User className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-900 dark:text-slate-100">Kepala Sekolah</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nama Lengkap & Gelar</Label>
                          <Input {...register("headmaster")} className="h-10 rounded-lg" placeholder="Contoh: Drs. H. Ahmad, M.Pd" />
                          {errors.headmaster && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.headmaster.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">NIP</Label>
                          <Input {...register("nipHeadmaster")} className="h-10 rounded-lg" placeholder="NIP Kepala Sekolah" />
                          {errors.nipHeadmaster && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.nipHeadmaster.message}</p>}
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-slate-100 dark:bg-slate-900" />

                    <div className="space-y-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                          <User className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-900 dark:text-slate-100">Wakasek Sarpras</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nama Lengkap & Gelar</Label>
                          <Input {...register("sarprasName")} className="h-10 rounded-lg" placeholder="Contoh: Budi Santoso, S.T" />
                          {errors.sarprasName && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.sarprasName.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">NIP</Label>
                          <Input {...register("nipSarpras")} className="h-10 rounded-lg" placeholder="NIP Wakasek Sarpras" />
                          {errors.nipSarpras && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.nipSarpras.message}</p>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50/50 dark:bg-slate-900/20 py-4 flex justify-end">
                    <Button type="submit" size="sm" className="h-9 px-6 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-95" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Simpan Perubahan
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </TabsContent>

            <TabsContent value="academic" className="space-y-4 pt-6">
              <AcademicYearsSettings />
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-6 pt-6">
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                <CardHeader className="border-b border-slate-50 dark:border-slate-900/50 bg-slate-50/30 dark:bg-slate-900/10">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Cadangan Database
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Unduh seluruh data aplikasi ke dalam file SQL untuk keamanan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl flex gap-3 items-start border border-blue-100 dark:border-blue-900/20">
                    <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-blue-900 dark:text-blue-100 uppercase tracking-tight">Rekomendasi Rutinitas</p>
                      <p className="text-blue-700 dark:text-blue-300 leading-relaxed mt-1">Lakukan pencadangan secara berkala setidaknya seminggu sekali atau sebelum melakukan pembaruan besar.</p>
                    </div>
                  </div>
                  <Button onClick={handleBackup} variant="outline" size="sm" className="w-full sm:w-auto h-9 font-bold rounded-lg px-4 border-slate-200 dark:border-slate-800">
                    <Download className="mr-2 h-4 w-4" /> Buat Cadangan (.json)
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-red-200 dark:border-red-900/30 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                <CardHeader className="border-b border-red-50 dark:border-red-900/10 bg-red-50/30 dark:bg-red-900/5">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-red-600">
                    <RotateCcw className="h-5 w-5" />
                    Pulihkan Database
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Kembalikan data dari file cadangan SQL. Tindakan ini berbahaya.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-5">
                  <div className="bg-red-50/50 dark:bg-red-900/10 p-4 rounded-xl flex gap-3 items-start text-red-900 dark:text-red-100 border border-red-100 dark:border-red-900/20">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold uppercase tracking-tight text-red-900">PERINGATAN KRITIS</p>
                      <p className="text-red-700 dark:text-red-300 leading-relaxed mt-1">Memulihkan database akan menghapus seluruh data saat ini dan menggantinya dengan isi file cadangan. Tindakan ini tidak dapat dibatalkan.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restore-file" className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Pilih File Cadangan (.json)</Label>
                    <Input
                      id="restore-file"
                      type="file"
                      accept=".json"
                      className="h-10 rounded-lg bg-white dark:bg-slate-950 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                      onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  <Button
                    onClick={() => setIsRestoreAlertOpen(true)}
                    disabled={!restoreFile}
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-auto h-9 font-bold rounded-lg px-6 shadow-lg shadow-red-500/20 transition-all active:scale-95"
                  >
                    <Upload className="mr-2 h-4 w-4" /> Mulai Pemulihan
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <AlertDialog open={isRestoreAlertOpen} onOpenChange={setIsRestoreAlertOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Konfirmasi Pemulihan Database
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda benar-benar yakin? Seluruh data saat ini akan ditimpa oleh file <strong>{restoreFile?.name}</strong>. Proses ini mungkin memakan waktu beberapa saat dan aplikasi akan menjadi tidak stabil selama proses berlangsung.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleRestore();
                  }}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isRestoring}
                >
                  {isRestoring ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Ya, Pulihkan Sekarang
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </RoleGuard>
  );
}
