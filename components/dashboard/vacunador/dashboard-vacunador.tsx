"use client"

import { useEffect, useState } from "react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Syringe, CalendarDays, Users, Activity } from "lucide-react"

interface Props {
  nombreUsuario: string
  establecimientoId: string | null
}

interface Stats {
  dosisHoy: number
  dosisMes: number
  pacientesAtendidos: number
  establecimiento_id: string | null
}

export function DashboardVacunador({ nombreUsuario, establecimientoId }: Props) {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch("/api/vacunador/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.stats))
  }, [])

  const hoy = new Date().toLocaleDateString("es-BO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground capitalize">{hoy}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Establecimiento: <span className="font-medium text-foreground">{establecimientoId ?? "No asignado"}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Dosis hoy"
          value={stats?.dosisHoy ?? "—"}
          icon={<Syringe className="h-4 w-4 text-muted-foreground" />}
          description="Vacunas aplicadas hoy"
        />
        <StatsCard
          title="Dosis este mes"
          value={stats?.dosisMes ?? "—"}
          icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
          description="Acumulado del mes actual"
        />
        <StatsCard
          title="Pacientes atendidos"
          value={stats?.pacientesAtendidos ?? "—"}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Total de pacientes únicos"
        />
      </div>

      <div className="rounded-lg border p-6 bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Acceso rápido</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Usa <strong>Registrar Vacuna</strong> en el menú para buscar un paciente y registrar una dosis del esquema PAI.
        </p>
      </div>
    </div>
  )
}
