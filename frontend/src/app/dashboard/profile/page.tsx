"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Loader2, Upload, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import api from "@/lib/api";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2 px-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-heading">Profil Pengguna</h1>
        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Kelola informasi akun dan keamanan Anda.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="w-full lg:w-80 h-fit border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
          <CardHeader className="flex flex-col items-center pb-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-900 shadow-xl">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.username}&background=0F172A&color=fff&size=200`} />
                <AvatarFallback className="bg-slate-100 dark:bg-slate-800"><User className="h-10 w-10 text-slate-400" /></AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="h-5 w-5 text-white" />
              </div>
            </div>
            <CardTitle className="mt-4 text-xl font-bold capitalize text-slate-900 dark:text-slate-100">{user?.username || 'User'}</CardTitle>
            <div className="mt-1 flex items-center px-2 py-0.5 bg-primary/10 text-primary rounded-full gap-1.5 border border-primary/20">
              <span className="h-1 w-1 rounded-full bg-primary" />
              <span className="text-[10px] font-black uppercase tracking-wider">{user?.role}</span>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Identitas Sistem</Label>
              <div className="flex items-center justify-between text-xs font-mono bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">UID:</span>
                <span className="text-slate-900 dark:text-slate-100 truncate max-w-[120px]">{user?.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl mb-6">
              <TabsTrigger value="account" className="rounded-lg font-bold text-xs uppercase tracking-widest py-2.5">Data Akun</TabsTrigger>
              <TabsTrigger value="password" className="rounded-lg font-bold text-xs uppercase tracking-widest py-2.5">Keamanan</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold">Detail Akun</CardTitle>
                  <CardDescription className="text-xs">Perbarui informasi email Anda di sini.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-2">
                  {user ? <AccountForm user={user} /> : (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6 text-slate-300" /></div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="password">
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold">Ganti Password</CardTitle>
                  <CardDescription className="text-xs">Gunakan password yang kuat untuk menjaga keamanan akun.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-2">
                  {user ? (
                    <ChangePasswordForm userId={user.id} username={user.username} />
                  ) : (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6 text-slate-300" /></div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}



function ChangePasswordForm({ userId, username }: { userId: string, username: string }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        userId,
        username,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success("Password berhasil diperbarui");
      reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengganti password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current" className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Password Saat Ini</Label>
        <Input id="current" type="password" placeholder="••••••••" className="h-10 rounded-lg" {...register('currentPassword', { required: true })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new" className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Password Baru</Label>
        <Input id="new" type="password" placeholder="••••••••" className="h-10 rounded-lg" {...register('newPassword', { required: true })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm" className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Konfirmasi Password</Label>
        <Input id="confirm" type="password" placeholder="••••••••" className="h-10 rounded-lg" {...register('confirmPassword', { required: true })} />
      </div>
      <div className="pt-2">
        <Button disabled={loading} className="w-full h-10 rounded-lg font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Perbarui Kata Sandi
        </Button>
      </div>
    </form>
  );
}

function AccountForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await api.patch('/users/profile', { email: data.email });
      updateUser({ email: response.data.email });
      toast.success("Profil berhasil diperbarui");
    } catch (err: any) {
      toast.error("Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Username</Label>
        <Input id="username" defaultValue={user?.username} disabled className="h-10 rounded-lg bg-slate-50 dark:bg-slate-900 border-dashed" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Alamat Email</Label>
        <Input id="email" type="email" placeholder="example@mail.com" defaultValue={user?.email} className="h-10 rounded-lg" {...register('email')} />
        <p className="text-[10px] text-slate-400 italic px-1">Email digunakan untuk reset password dan verifikasi akun.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="role" className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Hak Akses Sistem</Label>
        <Input id="role" defaultValue={user?.role} disabled className="h-10 rounded-lg bg-slate-50 dark:bg-slate-900 border-dashed uppercase font-black text-xs" />
      </div>
      <div className="pt-2">
        <Button disabled={loading} className="w-full h-10 rounded-lg font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Simpan Profil
        </Button>
      </div>
    </form>
  );
}
