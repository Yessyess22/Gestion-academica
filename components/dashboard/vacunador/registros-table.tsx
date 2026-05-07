"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Registro {
  registro_id: string
  fecha_vacunacion: string
  vacuna_nombre: string
  numero_dosis: number
  lote_vacuna: string
  aplicacion_oportuna: boolean
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

  useEffect(() => {
    fetch("/api/vacunador/registros")
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
            <TableHead>Dosis</TableHead>
            <TableHead>Lote</TableHead>
            <TableHead>Oportuna</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registros.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No hay registros aún
              </TableCell>
            </TableRow>
          ) : (
            registros.map((r) => (
              <TableRow key={r.registro_id}>
                <TableCell>{new Date(r.fecha_vacunacion).toLocaleDateString("es-BO")}</TableCell>
                <TableCell className="font-medium">
                  {r.pacientes
                    ? `${r.pacientes.apellido_paterno} ${r.pacientes.apellido_materno}, ${r.pacientes.nombre_paciente}`
                    : "—"}
                </TableCell>
                <TableCell>{r.vacuna_nombre}</TableCell>
                <TableCell>
                  <Badge variant="outline">Dosis {r.numero_dosis}</Badge>
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
  )
}
