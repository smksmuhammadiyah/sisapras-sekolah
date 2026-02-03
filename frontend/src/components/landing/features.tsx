import { CardSpotlight } from "./spotlight";
import { Box, ClipboardList, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      title: "Manajemen Aset",
      description: "Lacak seluruh aset sekolah dari pengadaan hingga penghapusan dengan mudah.",
      icon: Box,
    },
    {
      title: "Audit & Opname",
      description: "Fitur audit digital yang memudahkan pemeriksaan fisik aset secara berkala.",
      icon: ClipboardList,
    },
    {
      title: "Monitoring Stok",
      description: "Pantau stok barang habis pakai dengan notifikasi otomatis saat menipis.",
      icon: TrendingUp,
    },
    {
      title: "Keamanan Data",
      description: "Dilengkapi Role-Based Access Control untuk keamanan data yang terjamin.",
      icon: ShieldCheck,
    },
    {
      title: "Real-time Update",
      description: "Data selalu sinkron antar pengguna dengan performa tinggi.",
      icon: Zap,
    },
  ];

  return (
    <section id="features" className="py-20 bg-slate-950 relative">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-16">
          Fitur Unggulan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, idx) => (
            <CardSpotlight key={idx} className="flex flex-col items-start text-left p-6 h-full">
              <div className="h-12 w-12 rounded-lg bg-cyan-900/30 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </CardSpotlight>
          ))}
          <CardSpotlight className="md:col-span-2 md:col-start-2 bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-left">
                <h3 className="text-2xl font-bold text-white mb-4">Laporan Komprehensif</h3>
                <p className="text-slate-400 mb-6">
                  Dapatkan wawasan mendalam dengan laporan otomatis yang dapat diekspor ke PDF dan Excel. Memudahkan pelaporan ke yayasan atau dinas.
                </p>
              </div>
              <div className="flex-1 w-full bg-slate-900/50 rounded-lg p-4 border border-slate-800">
                <div className="space-y-2">
                  <div className="h-2 w-3/4 bg-slate-800 rounded animate-pulse" />
                  <div className="h-2 w-1/2 bg-slate-800 rounded animate-pulse" />
                  <div className="h-2 w-5/6 bg-slate-800 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </CardSpotlight>
        </div>
      </div>
    </section>
  );
}
