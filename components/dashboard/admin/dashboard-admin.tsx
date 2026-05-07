"use client"

import { useEffect, useState } from "react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Syringe, CalendarDays, Users, Building2, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface Stats {
  totalDosis: number
  dosisMes: number
  totalPacientes: number
  totalEstablecimientos: number
  sinCadenaFrio: number
}

export function DashboardAdmin() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d.stats); setLoading(false) })
  }, [])

  if (loading) return <div className="text-muted-foreground py-8 text-center">Cargando...</div>

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Total dosis registradas"
          value={stats?.totalDosis ?? 0}
          icon={<Syringe className="h-4 w-4 text-muted-foreground" />}
          description="Historial nacional completo"
        />
        <StatsCard
          title="Dosis este mes"
          value={stats?.dosisMes ?? 0}
          icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
          description="Mes actual"
        />
        <StatsCard
          title="Pacientes registrados"
          value={stats?.totalPacientes ?? 0}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Total nacional"
        />
        <StatsCard
          title="Establecimientos activos"
          value={stats?.totalEstablecimientos ?? 0}
          icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
          description="En toda Bolivia"
        />
        <StatsCard
          title="Sin cadena frío"
          value={stats?.sinCadenaFrio ?? 0}
          icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />}
          description="Establecimientos sin refrigeración"
        />
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button onClick={() => router.push("/admin/usuarios")}>Gestionar Usuarios</Button>
        <Button variant="outline" onClick={() => router.push("/admin/establecimientos")}>Establecimientos</Button>
        <Button variant="outline" onClick={() => router.push("/admin/registros")}>Ver Registros</Button>
        <Button variant="outline" onClick={() => router.push("/admin/reportes")}>Reportes</Button>
      </div>
    </div>
  )
}
