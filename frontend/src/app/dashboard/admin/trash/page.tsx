"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RefreshCcw, Trash2, ArchiveRestore, AlertCircle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { RoleGuard } from "@/components/auth/role-guard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function TrashBinPage() {
  const [activeTab, setActiveTab] = useState("assets")
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)

  useEffect(() => {
    fetchDeletedItems(activeTab)
  }, [activeTab])

  const fetchDeletedItems = async (type: string) => {
    setLoading(true)
    setData([])
    try {
      // Backend endpoints: /assets/trash/all, /rooms/trash/all, /procurements/trash/all
      const endpoint = type === 'procurements' ? '/procurements/trash/all' : `/${type}/trash/all`
      const res = await api.get(endpoint)
      setData(res.data)
    } catch (error) {
      console.error(error)
      toast.error(`Gagal memuat data sampah ${type}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (id: string, type: string) => {
    if (!confirm("Apakah Anda yakin ingin mengembalikan item ini?")) return

    setRestoring(id)
    try {
      const endpoint = type === 'procurements' ? `/procurements/${id}/restore` : `/${type}/${id}/restore`
      await api.patch(endpoint)
      toast.success("Item berhasil dikembalikan")
      // Remove from list
      setData(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      toast.error("Gagal mengembalikan item")
    } finally {
      setRestoring(null)
    }
  }

  // Format Date Helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const renderTable = () => {
    if (loading) {
      return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          <Trash2 className="mx-auto h-8 w-8 mb-3 opacity-50" />
          <p>Tong Sampah Kosong</p>
        </div>
      )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama / Judul</TableHead>
            <TableHead>Keterangan</TableHead>
            <TableHead>Dihapus Pada</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {item.name || item.title || "Tanpa Nama"}
                {item.code && <span className="block text-xs text-muted-foreground">{item.code}</span>}
              </TableCell>
              <TableCell>
                {activeTab === 'assets' && item.category}
                {activeTab === 'rooms' && item.type}
                {activeTab === 'procurements' && (
                  <Badge variant={item.priority === 'HIGH' ? 'destructive' : 'secondary'}>{item.priority}</Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(item.deletedAt)}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => handleRestore(item.id, activeTab)}
                  disabled={restoring === item.id}
                >
                  {restoring === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArchiveRestore className="h-4 w-4" />}
                  Pulihkan
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="space-y-6 container mx-auto px-6 py-6 max-w-5xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tong Sampah (Trash Bin)</h1>
            <p className="text-muted-foreground">Kelola data yang telah dihapus. Data disini tidak tampil di Dashboard utama.</p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Perhatian</AlertTitle>
          <AlertDescription>
            Item yang ada di sini masih tersimpan di database namun disembunyikan. Klik "Pulihkan" untuk mengembalikannya ke daftar aktif.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="p-0 border-b">
            {/* Custom Tab Header or just use Tabs */}
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="assets" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="assets">Aset ({activeTab === 'assets' ? data.length : '?'})</TabsTrigger>
                <TabsTrigger value="rooms">Ruangan ({activeTab === 'rooms' ? data.length : '?'})</TabsTrigger>
                <TabsTrigger value="procurements">Pengadaan ({activeTab === 'procurements' ? data.length : '?'})</TabsTrigger>
              </TabsList>

              <TabsContent value="assets" className="mt-0">
                {renderTable()}
              </TabsContent>
              <TabsContent value="rooms" className="mt-0">
                {renderTable()}
              </TabsContent>
              <TabsContent value="procurements" className="mt-0">
                {renderTable()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
