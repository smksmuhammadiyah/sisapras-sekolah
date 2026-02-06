"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { useRouter } from "next/navigation"
import { School, Loader2, ArrowLeft, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster, toast } from "sonner"
import Link from "next/link"

const registerSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  username: z.string().min(4, "Username minimal 4 karakter"),
  jabatan: z.string().min(1, "Jabatan harus dipilih"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak sama",
  path: ["confirmPassword"],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  })

  const selectedJabatan = watch("jabatan")

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/register`, {
        username: data.username,
        password: data.password,
        fullName: data.fullName,
        jabatan: data.jabatan
      })

      setIsSuccess(true)
      toast.success("Registrasi berhasil!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registrasi gagal")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <School className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">Registrasi Berhasil</CardTitle>
            <CardDescription className="text-base mt-2">
              Akun Anda telah dibuat dan sedang menunggu persetujuan dari Administrator.
              <br /><br />
              Silakan hubungi admin sekolah untuk aktivasi akun.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/login">
              <Button variant="outline">Kembali ke Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden grid lg:grid-cols-2">
      {/* Left: Branding */}
      <div className="hidden lg:flex flex-col bg-slate-900 text-white p-12 justify-between">
        <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <School className="w-8 h-8" />
          <span>SIM-SAPRAS</span>
        </div>

        <div className="space-y-6 max-w-lg">
          <h1 className="text-4xl font-extrabold leading-tight">
            Bergabung dengan Sistem Manajemen Aset Sekolah
          </h1>
          <p className="text-slate-400 text-lg">
            Daftarkan akun untuk mulai mengelola inventaris, mengajukan peminjaman, dan memantau aset sekolah.
          </p>
        </div>

        <div className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} SMK Negeri 1 Contoh. All rights reserved.
        </div>
      </div>

      {/* Right: Register Form */}
      <div className="flex items-center justify-center p-6 bg-white overflow-auto relative h-full">
        <div className="absolute top-6 right-6">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2">
            Sudah punya akun? <span className="text-primary underline">Login</span>
          </Link>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Buat Akun Baru</h2>
            <p className="text-muted-foreground">Isi formulir di bawah ini untuk mendaftar.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input id="fullName" placeholder="Contoh: Budi Santoso" {...register("fullName")} disabled={isLoading} />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="username_anda" {...register("username")} disabled={isLoading} />
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jabatan">Jabatan</Label>
              <Select
                onValueChange={(val) => setValue("jabatan", val)}
                disabled={isLoading}
              >
                <SelectTrigger id="jabatan">
                  <SelectValue placeholder="Pilih jabatan (Guru/Siswa)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Guru">Guru</SelectItem>
                  <SelectItem value="Siswa">Siswa</SelectItem>
                </SelectContent>
              </Select>
              {errors.jabatan && <p className="text-xs text-red-500">{errors.jabatan.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} disabled={isLoading} />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi</Label>
                <Input id="confirmPassword" type="password" {...register("confirmPassword")} disabled={isLoading} />
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Daftar Sekarang
            </Button>
          </form>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
