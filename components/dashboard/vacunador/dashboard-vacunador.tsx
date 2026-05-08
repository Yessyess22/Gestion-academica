"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Button } from "@/components/ui/button"
import { Syringe, CalendarDays, Users, ClipboardList, UserPlus } from "lucide-react"

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
  const router = useRouter()

  useEffect(() => {
    fetch("/api/vacunador/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.stats))
      .catch(() => {/* stats non-critical */})
  }, [])

  const hoy = new Date().toLocaleDateString("es-BO", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Bienvenido, {nombreUsuario}</h2>
        <p className="text-muted-foreground capitalize text-sm">{hoy}</p>
        {establecimientoId && (
          <p className="text-sm text-muted-foreground mt-0.5">
            Establecimiento: <span className="font-medium text-foreground">{establecimientoId}</span>
          </p>
        )}
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
          description="Pacientes únicos vacunados"
        />
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button onClick={() => router.push("/vacunador/vacunar")}>
          <Syringe className="mr-2 h-4 w-4" />
          Registrar Vacuna
        </Button>
        <Button variant="outline" onClick={() => router.push("/vacunador/pacientes")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Paciente
        </Button>
        <Button variant="outline" onClick={() => router.push("/vacunador/registros")}>
          <ClipboardList className="mr-2 h-4 w-4" />
          Mis Registros
        </Button>
      </div>
    </div>
  )
}
