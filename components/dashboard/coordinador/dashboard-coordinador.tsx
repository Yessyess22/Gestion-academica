"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Button } from "@/components/ui/button"
import { Syringe, CalendarDays, Building2, Activity, ClipboardList, BarChart3 } from "lucide-react"

interface Props {
  nombreUsuario: string
  departamento: string
}

interface Stats {
  dosisMes: number
  dosisAcumuladas: number
  establecimientos: number
  vacunasAplicadas: number
  departamento: string
}

export function DashboardCoordinador({ nombreUsuario, departamento }: Props) {
  const [stats, setStats] = useState<Stats | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/coordinador/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.stats))
      .catch(() => {/* stats non-critical */})
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Bienvenido, {nombreUsuario}</h2>
        <p className="text-sm text-muted-foreground">
          Departamento: <span className="font-medium text-foreground">{departamento || "No asignado"}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Dosis este mes"
          value={stats?.dosisMes ?? "—"}
          icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
          description="En tu departamento"
        />
        <StatsCard
          title="Total acumulado"
          value={stats?.dosisAcumuladas ?? "—"}
          icon={<Syringe className="h-4 w-4 text-muted-foreground" />}
          description="Dosis históricas"
        />
        <StatsCard
          title="Establecimientos"
          value={stats?.establecimientos ?? "—"}
          icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
          description="Activos en tu red"
        />
        <StatsCard
          title="Tipos de vacuna"
          value={stats?.vacunasAplicadas ?? "—"}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          description="Vacunas distintas aplicadas"
        />
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button onClick={() => router.push("/coordinador/registros")}>
          <ClipboardList className="mr-2 h-4 w-4" />
          Ver Registros
        </Button>
        <Button variant="outline" onClick={() => router.push("/coordinador/cobertura")}>
          <BarChart3 className="mr-2 h-4 w-4" />
          Análisis de Cobertura
        </Button>
      </div>
    </div>
  )
}
