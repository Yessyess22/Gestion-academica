"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

interface Establecimiento {
  establecimiento_id: string
  nombre_establecimiento: string
  tipo_establecimiento: string
  nivel_atencion: number
  zona: string
  departamento: string
  municipio: string
  red_salud: string
  tiene_cadena_frio: boolean
  activo: boolean
}

export function EstablecimientosTable() {
  const [items, setItems] = useState<Establecimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState("")

  useEffect(() => {
    async function cargar() {
      try {
        const r = await fetch("/api/admin/establecimientos")
        const d = await r.json()
        setItems(d.establecimientos ?? [])
      } catch {
        toast.error("Error al cargar establecimientos")
      } finally {
        setLoading(false)
      }
    }
    void cargar()
  }, [])

  const filtrados = items.filter((e) =>
    `${e.nombre_establecimiento} ${e.departamento} ${e.municipio}`.toLowerCase().includes(filtro.toLowerCase())
  )

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="space-y-4">
      <Input
        placeholder="Filtrar por nombre, departamento o municipio..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Red de Salud</TableHead>
              <TableHead>Cadena frío</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map((e) => (
              <TableRow key={e.establecimiento_id}>
                <TableCell className="font-medium">{e.nombre_establecimiento}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{e.tipo_establecimiento}</TableCell>
                <TableCell>
                  <Badge variant="outline">Nivel {e.nivel_atencion}</Badge>
                </TableCell>
                <TableCell>{e.departamento}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{e.red_salud}</TableCell>
                <TableCell>
                  {e.tiene_cadena_frio ? (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Sí</Badge>
                  ) : (
                    <Badge variant="destructive">No</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {e.activo ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
                  ) : (
                    <Badge variant="secondary">Inactivo</Badge>
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
