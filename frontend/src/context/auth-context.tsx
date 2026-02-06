"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  fullName?: string | null;
  role: string;
  email?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (token && savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(() => {
    // If we are in the browser, we start as NOT loading if we already checked local
    // But better to keeps it consistent. If we have a user, it's not loading.
    return false; // Initial sync load from local is instant
  });

  const router = useRouter();

  // No longer need effect for initial load
  useEffect(() => {
    // Keep empty for consistency or remove
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    // Redirect based on role
    if (userData.role === 'ADMIN') router.push('/dashboard/admin');
    else if (userData.role === 'STAFF') router.push('/dashboard/staff');
    else router.push('/dashboard/user');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
