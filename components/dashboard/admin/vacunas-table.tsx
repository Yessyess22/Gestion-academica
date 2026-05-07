"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Vacuna {
  vacuna_id: string
  vacuna_nombre: string
  enfermedad_previene: string
  grupo_pai: string
  numero_dosis: number
  dosis_descripcion: string
  edad_aplicacion_descripcion: string
  via_administracion: string
  dosis_ml: number
  condicion_especial: string | null
}

export function VacunasTable() {
  const [vacunas, setVacunas] = useState<Vacuna[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/vacunas")
      .then((r) => r.json())
      .then((d) => { setVacunas(d.vacunas ?? []); setLoading(false) })
  }, [])

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Vacuna</TableHead>
            <TableHead>Enfermedad</TableHead>
            <TableHead>Grupo PAI</TableHead>
            <TableHead>Dosis</TableHead>
            <TableHead>Edad aplicación</TableHead>
            <TableHead>Vía</TableHead>
            <TableHead>ml</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vacunas.map((v) => (
            <TableRow key={v.vacuna_id}>
              <TableCell className="font-mono text-xs text-muted-foreground">{v.vacuna_id}</TableCell>
              <TableCell className="font-medium">{v.vacuna_nombre}</TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{v.enfermedad_previene}</TableCell>
              <TableCell>
                <Badge variant={v.grupo_pai === "PAI Regular" ? "default" : "secondary"}>
                  {v.grupo_pai}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">{v.dosis_descripcion}</TableCell>
              <TableCell className="text-sm">{v.edad_aplicacion_descripcion}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{v.via_administracion}</TableCell>
              <TableCell className="text-sm">{v.dosis_ml}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
