"use client";

import { motion } from 'framer-motion';
import { CardSpotlight } from "./spotlight";
import { Check, AlertCircle, FileQuestion, PackageX } from 'lucide-react';

export function ContextSection() {
  return (
    <section className="py-24 bg-slate-950 text-slate-100 relative z-10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400"
            >
              Masalah yang sering terjadi di sekolah
            </motion.h2>
            <ul className="space-y-6">
              {[
                "Barang ada, tapi tidak tahu siapa yang pakai",
                "Stok habis tanpa peringatan",
                "Usulan barang menumpuk tanpa kejelasan",
                "Data tersebar di buku dan file berbeda"
              ].map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-4 text-lg text-slate-400"
                >
                  <div className="mt-1 p-1 bg-red-900/30 rounded-full">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent blur-3xl rounded-full" />
            <div className="relative grid grid-cols-2 gap-4 opacity-80">
              <div className="h-40 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-red-500/20 p-6 rotate-3 flex flex-col items-center justify-center gap-3 text-center shadow-2xl">
                <div className="p-3 bg-red-500/10 rounded-full">
                  <FileQuestion className="w-8 h-8 text-red-400" />
                </div>
                <span className="text-sm font-semibold text-red-200">Berkas Hilang?</span>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-red-500/50"></div>
                </div>
              </div>
              <div className="h-48 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-orange-500/20 p-6 -rotate-2 mt-8 flex flex-col items-center justify-center gap-3 text-center shadow-2xl">
                <div className="p-3 bg-orange-500/10 rounded-full">
                  <PackageX className="w-8 h-8 text-orange-400" />
                </div>
                <span className="text-sm font-semibold text-orange-200">Stok Minus</span>
                <div className="flex gap-1 w-full justify-center">
                  <div className="w-2 h-6 bg-slate-800 rounded-sm"></div>
                  <div className="w-2 h-6 bg-slate-800 rounded-sm"></div>
                  <div className="w-2 h-6 bg-red-500/50 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SolutionSection() {
  return (
    <section id="features" className="py-24 bg-slate-950 relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Dengan SIM-SAPRAS, semuanya berubah.</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Semua aset tercatat jelas", desc: "Digitalisasi inventaris dengan detail lengkap." },
            { title: "Stok terpantau otomatis", desc: "Notifikasi saat barang habis pakai menipis." },
            { title: "Usulan transparan", desc: "Status pengajuan bisa dipantau real-time." },
            { title: "Laporan siap kapan saja", desc: "Export PDF/Excel dalam sekali klik." }
          ].map((item, idx) => (
            <CardSpotlight key={idx} className="h-full items-start p-6">
              <div className="mb-4 p-3 bg-cyan-900/20 rounded-xl w-fit">
                <Check className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400">{item.desc}</p>
            </CardSpotlight>
          ))}
        </div>
      </div>
    </section>
  );
}
