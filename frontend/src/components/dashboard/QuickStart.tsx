"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

type Role = "ADMIN" | "STAFF" | "USER";

interface QuickStartProps {
  role: Role;
}

const CHECKLISTS = {
  ADMIN: {
    title: "Mulai Cepat Wakasek Sarpras",
    items: [
      { id: "profile", label: "Lengkapi Profil Sekolah" },
      { id: "room", label: "Tambahkan Data Ruangan" },
      { id: "asset", label: "Input Aset Pertama" },
      { id: "qr", label: "Cetak QR Code Aset" },
      { id: "audit", label: "Lakukan Audit Awal" },
    ],
  },
  STAFF: {
    title: "Mulai Cepat Petugas Sarpras",
    items: [
      { id: "stock", label: "Lihat Stok Tersedia" },
      { id: "scan", label: "Coba Scan QR Code" },
      { id: "audit", label: "Lakukan Audit Rutin" },
    ],
  },
  USER: {
    title: "Mulai Cepat Guru / Kaprog",
    items: [
      { id: "stock", label: "Lihat Stok Tersedia" },
      { id: "proposal", label: "Ajukan Usulan Barang" },
      { id: "status", label: "Pantau Status Usulan" },
    ],
  },
};

export function QuickStart({ role }: QuickStartProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [completed, setCompleted] = useState<string[]>([]);

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`quickstart_${role}`);
    if (saved) {
      setCompleted(JSON.parse(saved));
    }
  }, [role]);

  const toggleItem = (id: string) => {
    const newCompleted = completed.includes(id)
      ? completed.filter((c) => c !== id)
      : [...completed, id];

    setCompleted(newCompleted);
    localStorage.setItem(`quickstart_${role}`, JSON.stringify(newCompleted));
  };

  const config = CHECKLISTS[role] || CHECKLISTS.USER;
  const progress = (completed.length / config.items.length) * 100;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-8"
      >
        <Card className="border-l-4 border-l-primary shadow-sm bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
          <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
            <div>
              <CardTitle className="text-lg font-bold text-primary">
                {config.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Selesaikan langkah berikut untuk memulai sistem.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Progress value={progress} className="h-2" />
              <span className="text-sm font-medium whitespace-nowrap">
                {Math.round(progress)}% Selesai
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {config.items.map((item) => {
                const isChecked = completed.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                      ${isChecked
                        ? "bg-primary/5 border-primary/20"
                        : "bg-background hover:bg-muted/50"}
                    `}
                  >
                    <div className={`
                      flex-shrink-0 transition-colors
                      ${isChecked ? "text-primary" : "text-muted-foreground"}
                    `}>
                      {isChecked ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`
                      text-sm font-medium transition-colors
                      ${isChecked ? "text-foreground line-through opacity-70" : "text-foreground"}
                    `}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
