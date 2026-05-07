"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

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

  useEffect(() => {
    fetch("/api/coordinador/registros")
      .then((r) => r.json())
      .then((d) => { setRegistros(d.registros ?? []); setLoading(false) })
  }, [])

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>Vacuna</TableHead>
            <TableHead>Establecimiento</TableHead>
            <TableHead>Oportuna</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registros.map((r) => (
            <TableRow key={r.registro_id}>
              <TableCell>{new Date(r.fecha_vacunacion).toLocaleDateString("es-BO")}</TableCell>
              <TableCell>
                {r.pacientes ? `${r.pacientes.apellido_paterno}, ${r.pacientes.nombre_paciente}` : "—"}
              </TableCell>
              <TableCell>{r.vacuna_nombre}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{r.nombre_establecimiento}</TableCell>
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
  )
}
