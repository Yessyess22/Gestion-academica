"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

interface Paciente {
  paciente_id: string
  ci_paciente: string
  nombre_paciente: string
  apellido_paterno: string
  apellido_materno: string
  sexo: string
  fecha_nacimiento: string
  municipio_residencia: string
  comunidad_indigena: boolean
}

export function PacientesTable() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState("")

  useEffect(() => {
    fetch("/api/vacunador/pacientes")
      .then((r) => r.json())
      .then((d) => { setPacientes(d.pacientes ?? []); setLoading(false) })
  }, [])

  const edadTexto = (fechaNac: string) => {
    const dias = Math.floor((Date.now() - new Date(fechaNac).getTime()) / 86400000)
    if (dias < 365) return `${dias} días`
    if (dias < 730) return `${Math.floor(dias / 30)} meses`
    return `${Math.floor(dias / 365)} años`
  }

  const filtrados = pacientes.filter((p) =>
    `${p.nombre_paciente} ${p.apellido_paterno} ${p.apellido_materno} ${p.ci_paciente}`
      .toLowerCase()
      .includes(filtro.toLowerCase())
  )

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="space-y-4">
      <Input
        placeholder="Filtrar por nombre o CI..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>CI</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Sexo</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead>Com. indígena</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No se encontraron pacientes
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((p) => (
                <TableRow key={p.paciente_id}>
                  <TableCell className="font-medium">
                    {p.apellido_paterno} {p.apellido_materno}, {p.nombre_paciente}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.ci_paciente || "—"}</TableCell>
                  <TableCell>{edadTexto(p.fecha_nacimiento)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.sexo === "M" ? "Masculino" : "Femenino"}</Badge>
                  </TableCell>
                  <TableCell>{p.municipio_residencia || "—"}</TableCell>
                  <TableCell>
                    {p.comunidad_indigena ? (
                      <Badge variant="secondary">Sí</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">No</span>
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
