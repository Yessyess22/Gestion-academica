"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Registro {
  registro_id: string
  fecha_vacunacion: string
  vacuna_nombre: string
  numero_dosis: number
  lote_vacuna: string
  aplicacion_oportuna: boolean | null
  pacientes: {
    nombre_paciente: string
    apellido_paterno: string
    apellido_materno: string
    fecha_nacimiento: string
  } | null
}

export function RegistrosTable() {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState("")
  const [periodo, setPeriodo] = useState("todos")

  useEffect(() => {
    async function cargar() {
      try {
        const r = await fetch("/api/vacunador/registros")
        const d = await r.json()
        setRegistros(d.registros ?? [])
      } catch {
        toast.error("Error al cargar registros")
      } finally {
        setLoading(false)
      }
    }
    void cargar()
  }, [])

  const filtrados = registros.filter((r) => {
    const nombrePaciente = r.pacientes
      ? `${r.pacientes.apellido_paterno} ${r.pacientes.apellido_materno} ${r.pacientes.nombre_paciente}`.toLowerCase()
      : ""
    const matchTexto = filtro === "" || nombrePaciente.includes(filtro.toLowerCase()) ||
      r.vacuna_nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
      r.lote_vacuna?.toLowerCase().includes(filtro.toLowerCase())

    if (!matchTexto) return false

    if (periodo === "todos") return true
    const fecha = new Date(r.fecha_vacunacion)
    const ahora = new Date()
    if (periodo === "hoy") {
      return fecha.toDateString() === ahora.toDateString()
    }
    if (periodo === "mes") {
      return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
    }
    if (periodo === "semana") {
      const hace7 = new Date(); hace7.setDate(ahora.getDate() - 7)
      return fecha >= hace7
    }
    return true
  })

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Buscar por paciente, vacuna o lote..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="max-w-xs"
        />
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="hoy">Hoy</SelectItem>
            <SelectItem value="semana">Últimos 7 días</SelectItem>
            <SelectItem value="mes">Este mes</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtrados.length} registros</span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Vacuna</TableHead>
              <TableHead>Dosis</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead>Oportuna</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No hay registros
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((r) => (
                <TableRow key={r.registro_id}>
                  <TableCell>{new Date(r.fecha_vacunacion).toLocaleDateString("es-BO")}</TableCell>
                  <TableCell className="font-medium">
                    {r.pacientes
                      ? `${r.pacientes.apellido_paterno} ${r.pacientes.apellido_materno ?? ""}, ${r.pacientes.nombre_paciente}`
                      : "—"}
                  </TableCell>
                  <TableCell>{r.vacuna_nombre}</TableCell>
                  <TableCell>
                    {r.numero_dosis ? <Badge variant="outline">Dosis {r.numero_dosis}</Badge> : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.lote_vacuna}</TableCell>
                  <TableCell>
                    {r.aplicacion_oportuna === null ? (
                      <span className="text-muted-foreground text-sm">—</span>
                    ) : r.aplicacion_oportuna ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Oportuna</Badge>
                    ) : (
                      <Badge variant="destructive">Tardía</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
