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
  RefreshCcw,
  MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

import { SearchInput } from "@/components/ui/search-input"
import { Pagination } from "@/components/ui/pagination-controls"

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
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

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

  useEffect(() => {
    setPage(1)
  }, [searchTerm])

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

  const paginatedUsers = filteredUsers.slice((page - 1) * limit, page * limit)

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
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-heading truncate">Manajemen Pengguna</h1>
            <p className="text-slate-500 mt-1 text-xs sm:text-sm leading-relaxed max-w-2xl">Kelola akun, persetujuan, dan hak akses penuh sistem.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers(true)}
            disabled={isRefreshing}
            className="rounded-lg h-9 font-bold ml-auto sm:ml-0 transition-all active:scale-95"
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="w-full sm:max-w-md">
          <SearchInput
            onSearch={setSearchTerm}
            className="w-full h-10 rounded-xl shadow-sm bg-white dark:bg-slate-950"
            placeholder="Cari user atau nama..."
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-slate-950">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className={`p-2 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">{stat.value}</div>
              </div>
              <div className="mt-4">
                <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-[10px] sm:text-xs text-slate-400 leading-tight mt-0.5">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                <TableHead className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Pengguna</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Role & Identitas</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Status Akun</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Terdaftar</TableHead>
                <TableHead className="text-right pr-6 text-xs font-bold uppercase tracking-wider text-slate-500">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="group transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-slate-100 dark:border-slate-800">
                    <TableCell className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                          {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-none">{user.fullName || "-"}</span>
                          <span className="text-[10px] text-slate-500 mt-1 font-medium">@{user.username}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'STAFF' ? 'default' : user.role === 'SISWA' ? 'outline' : 'secondary'}
                          className={`w-fit text-[10px] px-2 py-0 border-none font-bold uppercase tracking-wider`}
                        >
                          {user.role}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">ID: {user.id.slice(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.isApproved ? (
                        <div className="flex items-center px-2 py-1 bg-green-500/10 text-green-600 rounded-full w-fit gap-2 border border-green-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
                          <span className="text-[11px] font-black uppercase tracking-wider">AKTIF</span>
                        </div>
                      ) : (
                        <div className="flex items-center px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded-full w-fit gap-2 border border-yellow-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-yellow-600 animate-bounce" />
                          <span className="text-[11px] font-black uppercase tracking-wider">MENUNGGU</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end items-center gap-2">
                        {!user.isApproved && (
                          <Button
                            size="sm"
                            className="h-8 rounded-lg bg-green-600 hover:bg-green-700 font-bold text-xs"
                            onClick={() => handleApprove(user.id)}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                              <MoreVertical className="h-4 w-4 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-2xl border-slate-200 dark:border-slate-800">
                            <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 px-2 py-1.5 tracking-widest">Kontrol Akses</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="rounded-lg gap-2 text-xs font-bold py-2" onClick={() => handleRoleChange(user.id, "ADMIN")}>
                              <ShieldAlert className="h-4 w-4 text-red-500" />
                              <span>Jadikan Admin</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg gap-2 text-xs font-bold py-2" onClick={() => handleRoleChange(user.id, "STAFF")}>
                              <ShieldCheck className="h-4 w-4 text-primary" />
                              <span>Jadikan Staff</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg gap-2 text-xs font-bold py-2" onClick={() => handleRoleChange(user.id, "SISWA")}>
                              <UserCog className="h-4 w-4 text-blue-500" />
                              <span>Jadikan Siswa</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg gap-2 text-xs font-bold py-2" onClick={() => handleRoleChange(user.id, "USER")}>
                              <Shield className="h-4 w-4 text-slate-500" />
                              <span>Jadikan User</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 rounded-lg gap-2 text-xs font-bold py-2" onClick={() => handleReject(user.id)}>
                              <X className="h-4 w-4" />
                              <span>Nonaktifkan / Reject</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-white rounded-lg gap-2 text-xs font-bold py-2 bg-red-50 dark:bg-red-500/10 focus:bg-red-600" onClick={() => setDeleteId(user.id)}>
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
                  <TableCell colSpan={5} className="h-40 text-center text-slate-400 font-medium italic text-sm">
                    {searchTerm ? 'Tidak ada pengguna yang cocok dengan pencarian.' : 'Belum ada pengguna.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filteredUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <div key={user.id} className="p-4 space-y-4 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 pr-2 overflow-hidden">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">{user.fullName || "-"}</span>
                      <span className="text-[10px] text-slate-500 font-medium mt-0.5">@{user.username}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0 rounded-full">
                        <MoreVertical className="h-4 w-4 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-2xl border-slate-200 dark:border-slate-800">
                      <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 px-2 py-1.5 tracking-widest">Kontrol Akses</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="rounded-lg gap-2 text-xs font-bold py-2" onClick={() => handleRoleChange(user.id, "ADMIN")}>
                        <ShieldAlert className="h-4 w-4 text-red-500" />
                        <span>Jadikan Admin</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg gap-2 text-xs font-bold py-2" onClick={() => handleRoleChange(user.id, "STAFF")}>
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <span>Jadikan Staff</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg gap-2 text-xs font-bold py-2" onClick={() => handleRoleChange(user.id, "SISWA")}>
                        <UserCog className="h-4 w-4 text-blue-500" />
                        <span>Jadikan Siswa</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg gap-2 text-xs font-bold py-2" onClick={() => handleRoleChange(user.id, "USER")}>
                        <Shield className="h-4 w-4 text-slate-500" />
                        <span>Jadikan User</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 rounded-lg gap-2 text-xs font-bold py-2" onClick={() => handleReject(user.id)}>
                        <X className="h-4 w-4" />
                        <span>Nonaktifkan / Reject</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-white rounded-lg gap-2 text-xs font-bold py-2 bg-red-50 dark:bg-red-500/10 focus:bg-red-600" onClick={() => setDeleteId(user.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span>Hapus Permanen</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge
                    variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'STAFF' ? 'default' : user.role === 'SISWA' ? 'outline' : 'secondary'}
                    className={`text-[9px] px-2 py-0 border-none font-bold uppercase tracking-wider`}
                  >
                    {user.role}
                  </Badge>
                  {user.isApproved ? (
                    <div className="flex items-center px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full gap-1.5 border border-green-500/20">
                      <span className="h-1 w-1 rounded-full bg-green-600" />
                      <span className="text-[9px] font-black uppercase tracking-wider">AKTIF</span>
                    </div>
                  ) : (
                    <div className="flex items-center px-2 py-0.5 bg-yellow-500/10 text-yellow-600 rounded-full gap-1.5 border border-yellow-500/20">
                      <span className="h-1 w-1 rounded-full bg-yellow-600" />
                      <span className="text-[9px] font-black uppercase tracking-wider">MENUNGGU</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-900/50 mt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Sejak {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {!user.isApproved && (
                    <Button
                      size="sm"
                      className="h-8 rounded-lg bg-green-600 hover:bg-green-700 font-bold text-[10px] px-4"
                      onClick={() => handleApprove(user.id)}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Approve Akun
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400 font-medium italic text-sm">
              {searchTerm ? 'Tidak ada pengguna yang cocok dengan pencarian.' : 'Belum ada pengguna.'}
            </div>
          )}
        </div>
      </div>

      {filteredUsers.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filteredUsers.length / limit)}
          onPageChange={setPage}
          itemsPerPage={limit}
          onItemsPerPageChange={setLimit}
          totalItems={filteredUsers.length}
        />
      )}

      <Card>
        {filteredUsers.length > 0 && (
          <div className="bg-muted/5 p-4 border-t border-muted/20 text-[10px] text-muted-foreground text-center">
            Gunakan dropdown untuk mengubah hak akses. Admin memiliki kontrol penuh atas sistem.
          </div>
        )}
      </Card>

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
