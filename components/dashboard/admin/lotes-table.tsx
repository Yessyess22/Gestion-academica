"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Loader2, Trash2 } from "lucide-react"

interface Vacuna { vacuna_id: string; vacuna_nombre: string; dosis_descripcion: string }
interface Lote {
  lote_id: string
  lote_codigo: string
  fecha_vencimiento: string
  cantidad_dosis: number | null
  activo: boolean
  vacunas_catalogo: { vacuna_nombre: string } | null
}

const EMPTY = { vacuna_id: "", lote_codigo: "", fecha_vencimiento: "", cantidad_dosis: "" }

export function LotesTable() {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [vacunas, setVacunas] = useState<Vacuna[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function cargar() {
    const [lotesRes, vacunasRes] = await Promise.all([
      fetch("/api/admin/lotes"),
      fetch("/api/admin/vacunas"),
    ])
    const lotesData = await lotesRes.json()
    const vacunasData = await vacunasRes.json()
    setLotes(lotesData.lotes ?? [])
    setVacunas(vacunasData.vacunas ?? [])
    setLoading(false)
  }

  useEffect(() => { void cargar() }, [])

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!form.vacuna_id) newErrors.vacuna_id = "Selecciona una vacuna"
    if (!form.lote_codigo.trim()) newErrors.lote_codigo = "El código de lote es obligatorio"
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setSaving(true)
    try {
      const res = await fetch("/api/admin/lotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Error al crear lote"); return }
      toast.success("Lote registrado")
      setOpen(false)
      setForm(EMPTY)
      void cargar()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  async function desactivar(loteId: string, codigo: string) {
    if (!confirm(`¿Desactivar el lote ${codigo}?`)) return
    const res = await fetch(`/api/admin/lotes?id=${loteId}`, { method: "DELETE" })
    if (res.ok) { toast.success("Lote desactivado"); void cargar() }
    else toast.error("Error al desactivar")
  }

  const activos = lotes.filter((l) => l.activo)

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar Lote
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Lote de Vacuna</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Vacuna *</Label>
                <Select value={form.vacuna_id} onValueChange={(v) => set("vacuna_id", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la vacuna" />
                  </SelectTrigger>
                  <SelectContent>
                    {vacunas.map((v) => (
                      <SelectItem key={v.vacuna_id} value={v.vacuna_id}>
                        {v.vacuna_nombre} {v.dosis_descripcion ? `— ${v.dosis_descripcion}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.vacuna_id && <p className="text-xs text-destructive">{errors.vacuna_id}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lote_codigo">Código de lote *</Label>
                <Input
                  id="lote_codigo"
                  placeholder="Ej: BCG-2025-BOL-003"
                  value={form.lote_codigo}
                  onChange={(e) => set("lote_codigo", e.target.value.toUpperCase())}
                />
                {errors.lote_codigo && <p className="text-xs text-destructive">{errors.lote_codigo}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fecha_vencimiento">Fecha vencimiento</Label>
                  <Input
                    id="fecha_vencimiento"
                    type="date"
                    value={form.fecha_vencimiento}
                    onChange={(e) => set("fecha_vencimiento", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cantidad_dosis">Cantidad de dosis</Label>
                  <Input
                    id="cantidad_dosis"
                    type="number"
                    min="1"
                    placeholder="500"
                    value={form.cantidad_dosis}
                    onChange={(e) => set("cantidad_dosis", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setOpen(false); setForm(EMPTY) }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : "Registrar Lote"}
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
              <TableHead>Código de lote</TableHead>
              <TableHead>Vacuna</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Dosis</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No hay lotes registrados
                </TableCell>
              </TableRow>
            ) : (
              activos.map((l) => {
                const vencido = l.fecha_vencimiento && new Date(l.fecha_vencimiento) < new Date()
                return (
                  <TableRow key={l.lote_id}>
                    <TableCell className="font-mono font-medium">{l.lote_codigo}</TableCell>
                    <TableCell>{l.vacunas_catalogo?.vacuna_nombre ?? "—"}</TableCell>
                    <TableCell className="text-sm">
                      {l.fecha_vencimiento
                        ? new Date(l.fecha_vencimiento).toLocaleDateString("es-BO")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm">{l.cantidad_dosis ?? "—"}</TableCell>
                    <TableCell>
                      {vencido ? (
                        <Badge variant="destructive">Vencido</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => desactivar(l.lote_id, l.lote_codigo)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
