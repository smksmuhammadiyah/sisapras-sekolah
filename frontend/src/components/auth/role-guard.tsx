"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to their dashboard if not authorized
        if (user.role === 'ADMIN') router.push('/dashboard/admin');
        else if (user.role === 'STAFF') router.push('/dashboard/staff');
        else router.push('/dashboard/user');
      }
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null; // Or a tailored "Access Denied" view
  }

  return <>{children}</>;
}
