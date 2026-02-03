"use client"

import { useState, useEffect } from "react"
import { WifiOff, AlertTriangle } from "lucide-react"

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 border border-destructive/20">
        <div className="p-2 bg-white/20 rounded-full">
          <WifiOff className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-sm">Koneksi Terputus</p>
          <p className="text-xs opacity-90">Anda sedang offline. Beberapa fitur mungkin tidak berjalan.</p>
        </div>
      </div>
    </div>
  )
}
