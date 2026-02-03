"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Database, CheckCircle, XCircle } from "lucide-react"

export function HealthStatusWidget() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30s
    return () => clearInterval(interval)
  }, [])

  const checkHealth = async () => {
    try {
      const res = await api.get('/health')
      setStatus(res.data)
    } catch (e) {
      setStatus({ status: 'error', database: 'unknown' })
    } finally {
      setLoading(false)
    }
  }

  const isOk = status?.status === 'ok'
  const isDbOk = status?.database === 'connected'

  if (loading) return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">System Status</CardTitle></CardHeader>
      <CardContent><div className="h-4 w-20 bg-muted animate-pulse rounded"></div></CardContent>
    </Card>
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">System Health</CardTitle>
        <Activity className={`h-4 w-4 ${isOk ? "text-green-500" : "text-red-500"}`} />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className={`text-2xl font-bold ${isOk ? "text-green-600" : "text-red-600"}`}>
            {isOk ? "Normal" : "Issues Detected"}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Database className="h-3 w-3" />
            <span>DB: {isDbOk ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
