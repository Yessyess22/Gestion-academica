"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Loader2 } from "lucide-react"

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

const EMPTY_FORM = {
  vacuna_id: "",
  vacuna_nombre: "",
  enfermedad_previene: "",
  grupo_pai: "",
  numero_dosis: "",
  dosis_descripcion: "",
  edad_aplicacion_descripcion: "",
  edad_minima_dias: "",
  edad_maxima_dias: "",
  via_administracion: "",
  sitio_aplicacion: "",
  dosis_ml: "",
  condicion_especial: "",
}

export function VacunasTable() {
  const [vacunas, setVacunas] = useState<Vacuna[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function cargarVacunas() {
    const res = await fetch("/api/admin/vacunas")
    const d = await res.json()
    setVacunas(d.vacunas ?? [])
    setLoading(false)
  }

  useEffect(() => { void cargarVacunas() }, [])

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!form.vacuna_id.trim()) newErrors.vacuna_id = "El ID es obligatorio (ej: BCG-01)"
    if (!form.vacuna_nombre.trim()) newErrors.vacuna_nombre = "El nombre es obligatorio"
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setSaving(true)
    try {
      const res = await fetch("/api/admin/vacunas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Error al crear vacuna"); return }
      toast.success("Vacuna agregada al catálogo")
      setOpen(false)
      setForm(EMPTY_FORM)
      void cargarVacunas()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Vacuna
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agregar Vacuna al Catálogo PAI</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="vacuna_id">ID Vacuna * <span className="text-xs text-muted-foreground">(ej: BCG-01)</span></Label>
                  <Input
                    id="vacuna_id"
                    placeholder="BCG-01"
                    value={form.vacuna_id}
                    onChange={(e) => set("vacuna_id", e.target.value)}
                  />
                  {errors.vacuna_id && <p className="text-xs text-destructive">{errors.vacuna_id}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vacuna_nombre">Nombre *</Label>
                  <Input
                    id="vacuna_nombre"
                    placeholder="BCG"
                    value={form.vacuna_nombre}
                    onChange={(e) => set("vacuna_nombre", e.target.value)}
                  />
                  {errors.vacuna_nombre && <p className="text-xs text-destructive">{errors.vacuna_nombre}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="enfermedad_previene">Enfermedad que previene</Label>
                <Input
                  id="enfermedad_previene"
                  placeholder="Tuberculosis"
                  value={form.enfermedad_previene}
                  onChange={(e) => set("enfermedad_previene", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Grupo PAI</Label>
                  <Select value={form.grupo_pai} onValueChange={(v) => set("grupo_pai", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAI Regular">PAI Regular</SelectItem>
                      <SelectItem value="PAI Especial">PAI Especial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="numero_dosis">Número de dosis</Label>
                  <Input
                    id="numero_dosis"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={form.numero_dosis}
                    onChange={(e) => set("numero_dosis", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dosis_descripcion">Descripción de dosis</Label>
                  <Input
                    id="dosis_descripcion"
                    placeholder="1ra Dosis"
                    value={form.dosis_descripcion}
                    onChange={(e) => set("dosis_descripcion", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edad_aplicacion_descripcion">Edad de aplicación</Label>
                  <Input
                    id="edad_aplicacion_descripcion"
                    placeholder="Al nacer"
                    value={form.edad_aplicacion_descripcion}
                    onChange={(e) => set("edad_aplicacion_descripcion", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edad_minima_dias">Edad mínima (días)</Label>
                  <Input
                    id="edad_minima_dias"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.edad_minima_dias}
                    onChange={(e) => set("edad_minima_dias", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edad_maxima_dias">Edad máxima (días)</Label>
                  <Input
                    id="edad_maxima_dias"
                    type="number"
                    min="0"
                    placeholder="3"
                    value={form.edad_maxima_dias}
                    onChange={(e) => set("edad_maxima_dias", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Vía de administración</Label>
                  <Select value={form.via_administracion} onValueChange={(v) => set("via_administracion", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Intramuscular">Intramuscular</SelectItem>
                      <SelectItem value="Subcutánea">Subcutánea</SelectItem>
                      <SelectItem value="Intradérmica">Intradérmica</SelectItem>
                      <SelectItem value="Oral">Oral</SelectItem>
                      <SelectItem value="Intranasal">Intranasal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sitio_aplicacion">Sitio de aplicación</Label>
                  <Input
                    id="sitio_aplicacion"
                    placeholder="Deltoides derecho"
                    value={form.sitio_aplicacion}
                    onChange={(e) => set("sitio_aplicacion", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dosis_ml">Dosis (ml)</Label>
                  <Input
                    id="dosis_ml"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.5"
                    value={form.dosis_ml}
                    onChange={(e) => set("dosis_ml", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="condicion_especial">Condición especial</Label>
                  <Input
                    id="condicion_especial"
                    placeholder="Solo para embarazadas"
                    value={form.condicion_especial}
                    onChange={(e) => set("condicion_especial", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setOpen(false); setForm(EMPTY_FORM); setErrors({}) }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : "Agregar Vacuna"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
            {vacunas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No hay vacunas en el catálogo
                </TableCell>
              </TableRow>
            ) : (
              vacunas.map((v) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
