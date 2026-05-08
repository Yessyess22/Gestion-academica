"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

interface Registro {
  registro_id: string
  fecha_vacunacion: string
  vacuna_nombre: string
  departamento: string
  nombre_establecimiento: string
  lote_vacuna: string
  aplicacion_oportuna: boolean | null
  pacientes: { nombre_paciente: string; apellido_paterno: string; sexo: string } | null
}

export function RegistrosAdminTable() {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState("")

  useEffect(() => {
    async function cargar() {
      try {
        const r = await fetch("/api/admin/registros")
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

  const filtrados = registros.filter((r) =>
    `${r.vacuna_nombre} ${r.departamento} ${r.nombre_establecimiento} ${r.pacientes?.apellido_paterno ?? ""}`
      .toLowerCase().includes(filtro.toLowerCase())
  )

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filtrar por vacuna, departamento, establecimiento..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="max-w-sm"
        />
        <span className="text-sm text-muted-foreground">{filtrados.length} registros</span>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Vacuna</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Establecimiento</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead>Oportuna</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map((r) => (
              <TableRow key={r.registro_id}>
                <TableCell>{new Date(r.fecha_vacunacion).toLocaleDateString("es-BO")}</TableCell>
                <TableCell>
                  {r.pacientes ? `${r.pacientes.apellido_paterno}, ${r.pacientes.nombre_paciente}` : "—"}
                </TableCell>
                <TableCell className="font-medium">{r.vacuna_nombre}</TableCell>
                <TableCell>{r.departamento}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">{r.nombre_establecimiento}</TableCell>
                <TableCell className="font-mono text-xs">{r.lote_vacuna}</TableCell>
                <TableCell>
                  {r.aplicacion_oportuna === null ? "—" : r.aplicacion_oportuna ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Oportuna</Badge>
                  ) : (
                    <Badge variant="destructive">Tardía</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
