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
  nombre_establecimiento: string
  aplicacion_oportuna: boolean | null
  pacientes: { nombre_paciente: string; apellido_paterno: string; sexo: string } | null
}

export function RegistrosCoordinador() {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState("")
  const [periodo, setPeriodo] = useState("mes")

  useEffect(() => {
    async function cargar() {
      try {
        const r = await fetch("/api/coordinador/registros")
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
    const texto = filtro.toLowerCase()
    const matchTexto = texto === "" ||
      r.vacuna_nombre?.toLowerCase().includes(texto) ||
      r.nombre_establecimiento?.toLowerCase().includes(texto) ||
      (r.pacientes && `${r.pacientes.apellido_paterno} ${r.pacientes.nombre_paciente}`.toLowerCase().includes(texto))

    if (!matchTexto) return false

    if (periodo === "todos") return true
    const fecha = new Date(r.fecha_vacunacion)
    const ahora = new Date()
    if (periodo === "mes") {
      return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
    }
    if (periodo === "trimestre") {
      const hace90 = new Date(); hace90.setDate(ahora.getDate() - 90)
      return fecha >= hace90
    }
    if (periodo === "anio") {
      return fecha.getFullYear() === ahora.getFullYear()
    }
    return true
  })

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Buscar por paciente, vacuna o establecimiento..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="max-w-sm"
        />
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los períodos</SelectItem>
            <SelectItem value="mes">Este mes</SelectItem>
            <SelectItem value="trimestre">Últimos 90 días</SelectItem>
            <SelectItem value="anio">Este año</SelectItem>
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
              <TableHead>Establecimiento</TableHead>
              <TableHead>Sexo</TableHead>
              <TableHead>Oportuna</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No se encontraron registros
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((r) => (
                <TableRow key={r.registro_id}>
                  <TableCell className="text-sm">
                    {new Date(r.fecha_vacunacion).toLocaleDateString("es-BO")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {r.pacientes
                      ? `${r.pacientes.apellido_paterno}, ${r.pacientes.nombre_paciente}`
                      : "—"}
                  </TableCell>
                  <TableCell>{r.vacuna_nombre}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">
                    {r.nombre_establecimiento || "—"}
                  </TableCell>
                  <TableCell>
                    {r.pacientes?.sexo ? (
                      <Badge variant="outline">{r.pacientes.sexo === "M" ? "M" : "F"}</Badge>
                    ) : "—"}
                  </TableCell>
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
