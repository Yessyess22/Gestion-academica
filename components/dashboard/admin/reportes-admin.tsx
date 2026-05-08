"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CoberturaDepto {
  departamento: string
  total: number
  oportunas: number
  porcentaje: number
}

interface DosisPorVacuna {
  vacuna: string
  total: number
}

export function ReportesAdmin() {
  const [cobertura, setCobertura] = useState<CoberturaDepto[]>([])
  const [dosis, setDosis] = useState<DosisPorVacuna[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const r = await fetch("/api/admin/reportes")
        const d = await r.json()
        setCobertura(d.cobertura_departamento ?? [])
        setDosis(d.dosis_por_vacuna ?? [])
      } catch {
        toast.error("Error al cargar reportes")
      } finally {
        setLoading(false)
      }
    }
    void cargar()
  }, [])

  const getColor = (pct: number) => {
    if (pct >= 90) return "bg-green-100 text-green-800"
    if (pct >= 70) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cobertura por Departamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Departamento</TableHead>
                <TableHead>Total dosis</TableHead>
                <TableHead>% Oportuna</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cobertura.map((c) => (
                <TableRow key={c.departamento}>
                  <TableCell className="font-medium">{c.departamento}</TableCell>
                  <TableCell>{c.total}</TableCell>
                  <TableCell>
                    <Badge className={`${getColor(c.porcentaje)} hover:opacity-90`}>{c.porcentaje}%</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {cobertura.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">Sin datos</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dosis por Vacuna (Nacional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vacuna</TableHead>
                <TableHead>Dosis aplicadas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dosis.map((d) => (
                <TableRow key={d.vacuna}>
                  <TableCell className="font-medium">{d.vacuna}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{d.total}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {dosis.length === 0 && (
                <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-6">Sin datos</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
