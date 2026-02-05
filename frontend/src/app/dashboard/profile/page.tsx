"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Profile</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="w-full md:w-1/3">
          <CardHeader className="flex flex-col items-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.username}&background=random`} />
              <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4 text-xl capitalize">{user?.username || 'User'}</CardTitle>
            <CardDescription>{user?.role}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1">
              <Label className="text-xs text-muted-foreground">User ID</Label>
              <div className="text-sm font-medium">{user?.id}</div>
            </div>
          </CardContent>
        </Card>

        <div className="w-full md:w-2/3">
          <Tabs defaultValue="account">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Account Info</TabsTrigger>
              <TabsTrigger value="password">Change Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Details</CardTitle>
                  <CardDescription>
                    Make changes to your account here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={user?.username} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" defaultValue={user?.role} disabled />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Ganti Password</CardTitle>
                  <CardDescription>
                    Perbarui keamanan akun Anda.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user ? (
                    <ChangePasswordForm userId={user.id} username={user.username} />
                  ) : (
                    <div>Loading...</div>
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
  const { register, handleSubmit, reset } = require('react-hook-form');
  const [error, setError] = useState('');

  const onSubmit = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    setLoading(true);
    try {
      await require('@/lib/api').default.post('/auth/change-password', {
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
        <Label htmlFor="current">Password Saat Ini</Label>
        <Input id="current" type="password" {...register('currentPassword')} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new">Password Baru</Label>
        <Input id="new" type="password" {...register('newPassword')} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Konfirmasi Password</Label>
        <Input id="confirm" type="password" {...register('confirmPassword')} required />
      </div>
      <Button disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Update Password
      </Button>
    </form>
  );
}
