"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function VisualStorySection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 5]);

  return (
    <section ref={ref} className="py-32 bg-slate-950 overflow-hidden relative">
      <div className="container mx-auto px-6 flex flex-col items-center">
        <div className="text-center mb-20 max-w-2xl">
          <h2 className="text-3xl font-bold text-slate-200 mb-4">Dari pencatatan manual</h2>
          <p className="text-xl text-slate-500">Menuju sistem yang tertib dan bisa diaudit</p>
        </div>

        {/* Abstract UI Representation - No Mockups */}
        <div className="relative w-full max-w-4xl h-[500px] flex items-center justify-center">
          {/* Layer 1: Base - The "Chaos" fading out */}
          <motion.div
            style={{ y: y1, opacity: 0.5 }}
            className="absolute top-10 left-10 w-64 h-80 bg-slate-800/80 rounded-xl border border-slate-700/50 p-6 rotate-[-6deg]"
          >
            <div className="flex items-center gap-2 mb-6 opacity-50">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-20 h-2 bg-slate-600 rounded" />
            </div>
            {/* Scattered lines */}
            <div className="space-y-4">
              <div className="h-2 w-full bg-slate-700/50 rounded rotate-1" />
              <div className="h-2 w-5/6 bg-slate-700/50 rounded -rotate-1" />
              <div className="h-2 w-full bg-slate-700/50 rounded rotate-2" />
              <div className="h-20 w-fit p-2 bg-slate-900/30 rounded border border-dashed border-slate-600/30 mt-4">
                <div className="w-16 h-2 bg-slate-700/30 rounded mb-2" />
                <div className="w-12 h-2 bg-slate-700/30 rounded" />
              </div>
            </div>
          </motion.div>

          {/* Layer 2: Transition */}
          <motion.div
            style={{ y: y2, rotate: rotate }}
            className="absolute z-10 w-96 h-64 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex gap-2">
                <div className="h-3 w-3 bg-yellow-500 rounded-full" />
                <div className="h-3 w-3 bg-slate-700 rounded-full" />
              </div>
              <div className="h-2 w-24 bg-slate-800 rounded overflow-hidden">
                <motion.div
                  animate={{ width: ["0%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-full bg-cyan-500/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-slate-800/50 rounded-lg border border-slate-700/50 flex flex-col justify-end p-2 gap-1">
                  <div className="w-full h-1/2 bg-slate-700/30 rounded-sm" />
                  <div className="w-2/3 h-2 bg-slate-700/50 rounded-sm" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Layer 3: Order - The "System" */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="absolute z-20 right-0 bottom-0 w-80 h-96 bg-gradient-to-br from-cyan-950 to-slate-950 border border-cyan-500/20 rounded-xl p-6 shadow-2xl shadow-cyan-900/20"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 border-b border-cyan-500/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <div className="h-4 w-4 bg-cyan-400 rounded-sm" />
                  </div>
                  <div>
                    <div className="h-3 w-24 bg-cyan-100/20 rounded mb-1" />
                    <div className="h-2 w-16 bg-cyan-100/10 rounded" />
                  </div>
                </div>
              </div>

              {/* Chart Area */}
              <div className="flex items-end justify-between h-32 mb-6 px-2 gap-2">
                {[40, 70, 50, 90, 65].map((h, i) => (
                  <div key={i} className="w-full bg-cyan-900/20 rounded-t-sm relative group overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="absolute bottom-0 w-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    />
                  </div>
                ))}
              </div>

              {/* List Area */}
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between items-center p-2 rounded hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                      <div className="h-2 w-20 bg-slate-700 rounded" />
                    </div>
                    <div className="h-2 w-8 bg-slate-800 rounded" />
                  </div>
                ))}
              </div>

              {/* Footer Status */}
              <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-cyan-400 font-mono">
                <span>SYSTEM: ONLINE</span>
                <span>v2.0</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
