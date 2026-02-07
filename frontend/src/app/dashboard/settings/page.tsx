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

  if (isFetching) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pengaturan Sekolah</h2>
          <p className="text-muted-foreground">Kelola informasi sekolah dan konfigurasi sistem.</p>
        </div>

        <Tabs defaultValue="identity" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="identity">Identitas & Pejabat</TabsTrigger>
            <TabsTrigger value="academic">Tahun Ajaran</TabsTrigger>
            <TabsTrigger value="maintenance">Pemeliharaan</TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="space-y-4 pt-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* existing card content inserted here via inner replacement logic if I could, but here I must replace the whole return block if I want to wrap it */}
              {/* Since I can't nest replace easily, I will replace the WHOLE return block and Paste the Original Form Content back inside. */}
              <Card>
                <CardHeader>
                  <CardTitle>Identitas Sekolah</CardTitle>
                  <CardDescription>Informasi dasar sekolah untuk KOP Surat</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Sekolah</Label>
                      <div className="relative">
                        <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="name" className="pl-9" {...register("name")} />
                      </div>
                      {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telepon</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="phone" className="pl-9" {...register("phone")} />
                      </div>
                      {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat Lengkap</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="address" className="pl-9" {...register("address")} />
                    </div>
                    {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="email" className="pl-9" {...register("email")} />
                      </div>
                      {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website (Opsional)</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="website" className="pl-9" {...register("website")} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Pejabat Penandatangan</CardTitle>
                  <CardDescription>Data pejabat untuk tanda tangan laporan resmi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-sm uppercase text-muted-foreground">Kepala Sekolah</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nama Lengkap & Gelar</Label>
                        <Input {...register("headmaster")} placeholder="Contoh: Drs. H. Ahmad, M.Pd" />
                        {errors.headmaster && <p className="text-xs text-red-500">{errors.headmaster.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>NIP</Label>
                        <Input {...register("nipHeadmaster")} placeholder="NIP Kepala Sekolah" />
                        {errors.nipHeadmaster && <p className="text-xs text-red-500">{errors.nipHeadmaster.message}</p>}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-sm uppercase text-muted-foreground">Wakasek Sarpras</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nama Lengkap & Gelar</Label>
                        <Input {...register("sarprasName")} placeholder="Contoh: Budi Santoso, S.T" />
                        {errors.sarprasName && <p className="text-xs text-red-500">{errors.sarprasName.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>NIP</Label>
                        <Input {...register("nipSarpras")} placeholder="NIP Wakasek Sarpras" />
                        {errors.nipSarpras && <p className="text-xs text-red-500">{errors.nipSarpras.message}</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 py-4 flex justify-end">
                  <Button type="submit" size="lg" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan Perubahan
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="academic" className="space-y-4 pt-4">
            <AcademicYearsSettings />
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Cadangan Database
                </CardTitle>
                <CardDescription>
                  Unduh seluruh data aplikasi ke dalam file SQL untuk keamanan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-3 items-start">
                  <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900 dark:text-blue-100">Rekomendasi Rutinitas</p>
                    <p className="text-blue-700 dark:text-blue-300">Lakukan pencadangan secara berkala setidaknya seminggu sekali atau sebelum melakukan pembaruan besar.</p>
                  </div>
                </div>
                <Button onClick={handleBackup} variant="outline" className="w-full md:w-auto">
                  <Download className="mr-2 h-4 w-4" /> Buat Cadangan (.sql)
                </Button>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <RotateCcw className="h-5 w-5" />
                  Pulihkan Database
                </CardTitle>
                <CardDescription>
                  Kembalikan data dari file cadangan SQL. Tindakan ini berbahaya.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex gap-3 items-start text-red-900 dark:text-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold">PERINGATAN KRITIS</p>
                    <p className="text-red-700 dark:text-red-300">Memulihkan database akan menghapus seluruh data saat ini dan menggantinya dengan isi file cadangan. Tindakan ini tidak dapat dibatalkan.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restore-file">Pilih File Cadangan (.sql)</Label>
                  <Input
                    id="restore-file"
                    type="file"
                    accept=".sql"
                    onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                  />
                </div>

                <Button
                  onClick={() => setIsRestoreAlertOpen(true)}
                  disabled={!restoreFile}
                  variant="destructive"
                  className="w-full md:w-auto"
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
    </RoleGuard>
  )
}
