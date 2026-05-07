"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Cobertura {
  vacuna: string
  total: number
  oportunas: number
  porcentaje_oportuno: number
}

export function CoberturaCoordinador() {
  const [cobertura, setCobertura] = useState<Cobertura[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/coordinador/cobertura")
      .then((r) => r.json())
      .then((d) => { setCobertura(d.cobertura ?? []); setLoading(false) })
  }, [])

  if (loading) return <Skeleton className="h-64 w-full" />

  const getVariant = (pct: number) => {
    if (pct >= 90) return "bg-green-100 text-green-800"
    if (pct >= 70) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vacuna</TableHead>
            <TableHead>Total dosis</TableHead>
            <TableHead>Oportunas</TableHead>
            <TableHead>% Oportuna</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cobertura.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">Sin datos</TableCell>
            </TableRow>
          ) : (
            cobertura.map((c) => (
              <TableRow key={c.vacuna}>
                <TableCell className="font-medium">{c.vacuna}</TableCell>
                <TableCell>{c.total}</TableCell>
                <TableCell>{c.oportunas}</TableCell>
                <TableCell>
                  <Badge className={`${getVariant(c.porcentaje_oportuno)} hover:opacity-90`}>
                    {c.porcentaje_oportuno}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
