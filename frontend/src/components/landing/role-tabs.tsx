"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { User, ClipboardList, PenTool } from "lucide-react";

const roles = [
  {
    id: "admin",
    label: "Wakasek Sarpras",
    icon: User,
    color: "from-blue-500 to-indigo-500",
    content: {
      title: "Kendali Penuh & Pengawasan",
      desc: "Pantau aset sekolah secara global, setujui usulan pengadaan dengan satu klik, dan unduh laporan audit untuk yayasan atau dinas.",
      features: ["Dashboard Eksekutif", "Approval E-Usulan", "Laporan Audit Otomatis"]
    }
  },
  {
    id: "staff",
    label: "Petugas Sarpras",
    icon: ClipboardList,
    color: "from-emerald-500 to-teal-500",
    content: {
      title: "Manajemen Operasional Harian",
      desc: "Catat barang masuk/keluar, update kondisi aset secara real-time via mobile saat keliling sekolah, dan kelola stok habis pakai.",
      features: ["Scan QR Code Aset", "Update Kondisi Cepat", "Notifikasi Stok Menipis"]
    }
  },
  {
    id: "user",
    label: "Guru / Kaprog",
    icon: PenTool,
    color: "from-orange-500 to-amber-500",
    content: {
      title: "Pengajuan Tanpa Ribet",
      desc: "Ajukan kebutuhan alat praktek atau perbaikan fasilitas kelas langsung dari HP tanpa perlu isi formulir kertas yang sering hilang.",
      features: ["Form Usulan Simpel", "Tracking Status Usulan", "Riwayat Peminjaman"]
    }
  }
];

export function RoleBasedSection() {
  const [activeTab, setActiveTab] = useState(roles[0].id);

  return (
    <section className="py-24 bg-slate-900 border-y border-white/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Bukan Satu Untuk Semua</h2>
          <p className="text-slate-400">Pengalaman yang disesuaikan dengan peran Anda di sekolah</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start max-w-5xl mx-auto">
          {/* Custom Tabs */}
          <div className="w-full lg:w-1/3 flex flex-col gap-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setActiveTab(role.id)}
                className={cn(
                  "relative flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300",
                  activeTab === role.id ? "bg-white/10 text-white" : "hover:bg-white/5 text-slate-500 hover:text-slate-300"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg bg-gradient-to-br",
                  activeTab === role.id ? role.color : "from-slate-800 to-slate-900 grayscale opacity-50"
                )}>
                  <role.icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-lg">{role.label}</span>
                {activeTab === role.id && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-0 rounded-xl bg-white/5 border border-white/10 z-[-1]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Content Panel */}
          <div className="w-full lg:w-2/3 min-h-[300px] relative">
            <AnimatePresence mode="wait">
              {roles.map((role) => (
                role.id === activeTab ? (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl"
                  >
                    <h3 className="text-2xl font-bold text-white mb-4">{role.content.title}</h3>
                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                      {role.content.desc}
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {role.content.features.map((feature, i) => (
                        <div key={i} className="bg-slate-900 rounded-lg p-3 text-sm text-cyan-200 border border-cyan-500/20 text-center">
                          {feature}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : null
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
