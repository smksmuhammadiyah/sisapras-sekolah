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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daftar Tahun Ajaran</CardTitle>
          <CardDescription>Kelola siklus tahun ajaran sekolah</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Tahun Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Tahun Ajaran Baru</DialogTitle>
              <DialogDescription>
                Buat periode tahun ajaran baru. Periode baru tidak otomatis aktif kecuali baru pertama kali dibuat.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Periode</Label>
                <Input id="name" placeholder="Contoh: 2025/2026" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start">Mulai</Label>
                  <Input id="start" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">Selesai</Label>
                  <Input id="end" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button onClick={handleCreate} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Periode</TableHead>
              <TableHead>Durasi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {years.map((year) => (
              <TableRow key={year.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {year.name}
                </TableCell>
                <TableCell>
                  {format(new Date(year.startDate), 'd MMM yyyy', { locale: id })} - {format(new Date(year.endDate), 'd MMM yyyy', { locale: id })}
                </TableCell>
                <TableCell>
                  {year.isActive ? (
                    <Badge className="bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Aktif
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Arsip</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {!year.isActive && (
                    <Button variant="ghost" size="sm" onClick={() => handleSetActive(year.id)}>
                      Set Aktif
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {years.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Belum ada data tahun ajaran.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
