"use client";

import { motion } from "framer-motion";
import { ArrowRight, School } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function FlowSection() {
  const steps = [
    { label: "Catat", desc: "Digitalisasi aset" },
    { label: "Pantau", desc: "Monitoring kondisi" },
    { label: "Ajukan", desc: "Usulan kebutuhan" },
    { label: "Setujui", desc: "Approval & Disposisi" },
    { label: "Laporkan", desc: "Rekapitulasi otomatis" }
  ];

  return (
    <section className="py-24 bg-slate-950 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-2">Alur Kerja Sederhana</h2>
          <p className="text-slate-500">Siklus manajemen yang tertutup dan rapi</p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-cyan-500 group-hover:bg-cyan-950 transition-colors flex items-center justify-center mb-4 z-10 relative">
                  <span className="font-mono text-slate-500 group-hover:text-cyan-400 font-bold">{idx + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">{step.label}</h3>
                <p className="text-sm text-slate-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TrustSection() {
  return (
    <section className="py-20 bg-slate-950 border-t border-slate-900">
      <div className="container mx-auto px-6 text-center">
        <p className="text-slate-600 mb-8 uppercase tracking-widest text-sm font-semibold">Digunakan untuk mendukung pengelolaan sarana pendidikan</p>
        <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
          {/* Abstract Logos for "Trust" - text based for now to keep it clean/simple/monochrome */}
          <div className="flex items-center gap-2 text-xl font-bold text-slate-400"><School className="h-6 w-6" /> SMK NEGERI</div>
          <div className="flex items-center gap-2 text-xl font-bold text-slate-400"><School className="h-6 w-6" /> SMA SWASTA</div>
          <div className="flex items-center gap-2 text-xl font-bold text-slate-400"><School className="h-6 w-6" /> INSTITUT</div>
          <div className="flex items-center gap-2 text-xl font-bold text-slate-400"><School className="h-6 w-6" /> YAYASAN</div>
        </div>
      </div>
    </section>
  );
}

export function CTAEmotionalSection() {
  return (
    <section className="py-32 bg-slate-950 relative overflow-hidden">
      {/* Background subtle effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-950/20" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight"
        >
          Mulai dari keteraturan kecil,<br />untuk dampak besar.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button size="lg" className="h-14 px-10 rounded-full bg-slate-100 text-slate-900 hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl shadow-white/10 text-lg font-bold" asChild>
            <Link href="/login">Mulai Kelola Sarpras</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
