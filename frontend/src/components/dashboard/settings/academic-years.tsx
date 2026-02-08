"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Loader2, Plus, Calendar, CheckCircle2, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface AcademicYear {
  id: string
  name: string
  isActive: boolean
  startDate: string
  endDate: string
}

export function AcademicYearsSettings() {
  const [years, setYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  // Form State
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchYears = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/years`)
      setYears(res.data)
    } catch (error) {
      toast.error("Gagal memuat tahun ajaran")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchYears()
  }, [])

  const handleCreate = async () => {
    if (!name || !startDate || !endDate) return

    setIsSubmitting(true)
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/years`,
        { name, startDate, endDate },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      toast.success("Tahun ajaran berhasil ditambahkan")
      setOpen(false)
      fetchYears()
      // Reset form
      setName("")
      setStartDate("")
      setEndDate("")
    } catch (error) {
      toast.error("Gagal menambahkan tahun ajaran")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSetActive = async (id: string) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/years/${id}/active`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      toast.success("Tahun ajaran aktif diperbarui")
      fetchYears()
    } catch (error) {
      toast.error("Gagal mengubah status aktif")
    }
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-950">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-900/50 bg-slate-50/30 dark:bg-slate-900/10">
        <div>
          <CardTitle className="text-lg font-bold">Daftar Tahun Ajaran</CardTitle>
          <CardDescription className="text-xs">Kelola siklus tahun ajaran sekolah</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto h-9 font-bold rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95">
              <Plus className="w-4 h-4 mr-2" />
              Tahun Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-slate-200 dark:border-slate-800 rounded-2xl">
            <DialogHeader className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <DialogTitle className="text-xl font-bold">Tambah Tahun Ajaran Baru</DialogTitle>
              <DialogDescription className="text-xs">
                Buat periode tahun ajaran baru untuk siklus pendataan.
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Nama Periode</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="name" placeholder="Contoh: 2025/2026" className="pl-10 h-10 rounded-lg" value={name} onChange={e => setName(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start" className="text-xs font-bold uppercase tracking-wider text-slate-500">Mulai</Label>
                  <Input id="start" type="date" className="h-10 rounded-lg" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end" className="text-xs font-bold uppercase tracking-wider text-slate-500">Selesai</Label>
                  <Input id="end" type="date" className="h-10 rounded-lg" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
            </div>
            <DialogFooter className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
              <Button variant="ghost" className="rounded-lg font-bold" onClick={() => setOpen(false)}>Batal</Button>
              <Button onClick={handleCreate} disabled={isSubmitting} className="rounded-lg font-bold shadow-lg shadow-primary/20">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Simpan Periode
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop View Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                <TableHead className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Periode</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Durasi</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</TableHead>
                <TableHead className="text-right pr-6 text-xs font-bold uppercase tracking-wider text-slate-500">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {years.map((year) => (
                <TableRow key={year.id} className="group transition-all hover:bg-slate-50/30 dark:hover:bg-slate-900/30 border-slate-100 dark:border-slate-800">
                  <TableCell className="py-4 px-6 font-bold text-sm text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                        <Calendar className="w-4 h-4" />
                      </div>
                      {year.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-400 italic">
                    {format(new Date(year.startDate), 'd MMM yyyy', { locale: id })} - {format(new Date(year.endDate), 'd MMM yyyy', { locale: id })}
                  </TableCell>
                  <TableCell>
                    {year.isActive ? (
                      <div className="flex items-center px-2 py-1 bg-green-500/10 text-green-600 rounded-full w-fit gap-2 border border-green-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider">AKTIF</span>
                      </div>
                    ) : (
                      <div className="flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full w-fit gap-2 border border-slate-200 dark:border-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-wider">ARSIP</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {!year.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95"
                        onClick={() => handleSetActive(year.id)}
                      >
                        Set Aktif
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {years.length > 0 ? (
            years.map((year) => (
              <div key={year.id} className="p-4 space-y-4 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">{year.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 italic">
                        {format(new Date(year.startDate), 'd MMM yyyy', { locale: id })} - {format(new Date(year.endDate), 'd MMM yyyy', { locale: id })}
                      </p>
                    </div>
                  </div>
                  {year.isActive ? (
                    <div className="flex items-center px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full gap-1.5 border border-green-500/20">
                      <span className="h-1 w-1 rounded-full bg-green-600" />
                      <span className="text-[9px] font-black uppercase tracking-wider">AKTIF</span>
                    </div>
                  ) : (
                    <div className="flex items-center px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full gap-1.5 border border-slate-200 dark:border-slate-700">
                      <span className="h-1 w-1 rounded-full bg-slate-400" />
                      <span className="text-[9px] font-black uppercase tracking-wider">ARSIP</span>
                    </div>
                  )}
                </div>
                {!year.isActive && (
                  <Button
                    variant="outline"
                    className="w-full h-9 text-[10px] font-black uppercase tracking-widest rounded-lg border-slate-200 dark:border-slate-800 active:scale-95 transition-all text-slate-600 dark:text-slate-400"
                    onClick={() => handleSetActive(year.id)}
                  >
                    Atur sebagai Aktif
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-400 font-medium italic">Belum ada data tahun ajaran.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
