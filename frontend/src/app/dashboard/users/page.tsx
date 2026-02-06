"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Loader2,
  Check,
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
  UserCheck,
  UserPlus,
  UserCog,
  Search,
  RefreshCcw,
  MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Input } from "@/components/ui/input"

interface User {
  id: string
  username: string
  fullName: string
  role: "ADMIN" | "STAFF" | "USER" | "GUEST" | "SISWA"
  isApproved: boolean
  createdAt: string
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchUsers = async (silent = false) => {
    if (!silent) setIsLoading(true)
    else setIsRefreshing(true)

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setUsers(response.data)
    } catch (error) {
      toast.error("Gagal memuat data user")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleApprove = async (id: string) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users/${id}/status`,
        { isApproved: true },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      toast.success("User berhasil disetujui")
      fetchUsers(true)
    } catch (error) {
      toast.error("Gagal menyetujui user")
    }
  }

  const handleReject = async (id: string) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users/${id}/status`,
        { isApproved: false },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      toast.success("User dinonaktifkan")
      fetchUsers(true)
    } catch (error) {
      toast.error("Gagal menolak user")
    }
  }

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users/${id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      toast.success(`Role diubah menjadi ${newRole}`)
      fetchUsers(true)
    } catch (error) {
      toast.error("Gagal mengubah role")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users/${deleteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      toast.success("User berhasil dihapus")
      fetchUsers(true)
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal menghapus user"
      toast.error(msg)
    } finally {
      setDeleteId(null)
    }
  }

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.fullName || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = [
    {
      label: "Total Pengguna",
      value: users.length,
      icon: Users,
      color: "bg-blue-500/10 text-blue-600",
      description: "Seluruh akun terdaftar"
    },
    {
      label: "User Aktif",
      value: users.filter(u => u.isApproved).length,
      icon: UserCheck,
      color: "bg-green-500/10 text-green-600",
      description: "Telah disetujui"
    },
    {
      label: "Menunggu Approval",
      value: users.filter(u => !u.isApproved).length,
      icon: UserPlus,
      color: "bg-yellow-500/10 text-yellow-600",
      description: "Butuh tindakan admin"
    },
    {
      label: "Administrator",
      value: users.filter(u => u.role === 'ADMIN').length,
      icon: ShieldAlert,
      color: "bg-red-500/10 text-red-600",
      description: "Super user sistem"
    }
  ]

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Menyiapkan data pengguna...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Manajemen Pengguna</h2>
          <p className="text-muted-foreground">Kelola akun, persetujuan, dan hak akses penuh sistem.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchUsers(true)}
          disabled={isRefreshing}
          className="rounded-full px-4 hover:bg-primary hover:text-white transition-all duration-300"
        >
          <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className={`p-2 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-xs text-muted-foreground/60">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <Card className="border-none shadow-xl bg-card/30 backdrop-blur-md overflow-hidden">
        <CardHeader className="bg-muted/30 pb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl">Daftar Pengguna</CardTitle>
              <CardDescription>Menampilkan {filteredUsers.length} pengguna dari total {users.length}</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari user atau nama..."
                className="pl-10 bg-background/50 border-muted-foreground/20 focus:ring-primary/20 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="hover:bg-transparent border-b border-muted">
                  <TableHead className="py-4 pl-6">Pengguna</TableHead>
                  <TableHead>Role & Identitas</TableHead>
                  <TableHead>Status Akun</TableHead>
                  <TableHead>Terdaftar</TableHead>
                  <TableHead className="text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="group hover:bg-muted/20 transition-colors duration-200">
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground leading-none">{user.fullName || "-"}</span>
                            <span className="text-xs text-muted-foreground mt-1">@{user.username}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'STAFF' ? 'default' : user.role === 'SISWA' ? 'outline' : 'secondary'}
                            className={`w-fit text-[10px] px-2 py-0 ${user.role === 'SISWA' ? 'border-primary text-primary bg-primary/5' : ''}`}
                          >
                            {user.role}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">ID: {user.id.slice(0, 8)}...</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.isApproved ? (
                          <div className="flex items-center px-2 py-1 bg-green-500/10 text-green-600 rounded-full w-fit gap-1 border border-green-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
                            <span className="text-[11px] font-bold">AKTIF</span>
                          </div>
                        ) : (
                          <div className="flex items-center px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded-full w-fit gap-1 border border-yellow-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow-600 animate-bounce" />
                            <span className="text-[11px] font-bold uppercase tracking-tight">Menunggu</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end items-center gap-2">
                          {!user.isApproved && (
                            <Button
                              size="sm"
                              className="h-8 rounded-lg bg-green-600 hover:bg-green-700 shadow-sm"
                              onClick={() => handleApprove(user.id)}
                            >
                              <Check className="w-3.5 h-3.5 mr-1" /> Approve
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted group-hover:scale-110 transition-transform">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl shadow-2xl border-muted-foreground/10">
                              <DropdownMenuLabel className="text-xs uppercase text-muted-foreground/60 px-2 py-1.5">Kontrol Akses</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="rounded-lg gap-2" onClick={() => handleRoleChange(user.id, "ADMIN")}>
                                <ShieldAlert className="h-4 w-4 text-red-500" />
                                <span>Jadikan Admin</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-lg gap-2" onClick={() => handleRoleChange(user.id, "STAFF")}>
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                <span>Jadikan Staff</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-lg gap-2" onClick={() => handleRoleChange(user.id, "SISWA")}>
                                <UserCog className="h-4 w-4 text-blue-500" />
                                <span>Jadikan Siswa</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-lg gap-2" onClick={() => handleRoleChange(user.id, "USER")}>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span>Jadikan User</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600 rounded-lg gap-2" onClick={() => handleReject(user.id)}>
                                <X className="h-4 w-4" />
                                <span>Nonaktifkan / Reject</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 focus:text-white rounded-lg gap-2 bg-red-50 focus:bg-red-600" onClick={() => setDeleteId(user.id)}>
                                <Trash2 className="h-4 w-4" />
                                <span>Hapus Permanen</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                      Tidak ada pengguna yang cocok dengan pencarian.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {filteredUsers.length > 0 && (
          <div className="bg-muted/5 p-4 border-t border-muted/20 text-[10px] text-muted-foreground text-center">
            Gunakan dropdown untuk mengubah hak akses. Admin memiliki kontrol penuh atas sistem.
          </div>
        )}
      </Card>

      {/* AlertDialog remains for safety */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl border-muted-foreground/10 shadow-2xl backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-red-600">Hapus Akun Permanen?</AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Langkah ini tidak dapat dibatalkan. Menghapus akun akan memutus akses pengguna tersebut dari sistem selamanya.
              <br /><br />
              <span className="text-xs bg-red-50 text-red-600 p-2 rounded-lg block border border-red-100 italic">
                Sistem tidak akan menghapus user jika terdapat riwayat data (aset, pinjaman, dsb) demi integritas laporan.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="rounded-xl border-muted-foreground/20">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200">
              Ya, Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
