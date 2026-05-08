"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { pacienteSchema, type PacienteFormData } from "@/lib/validations/paciente"
import { UserPlus, Loader2 } from "lucide-react"

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
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const form = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: {
      ci_paciente: "",
      nombre_paciente: "",
      apellido_paterno: "",
      apellido_materno: "",
      sexo: undefined,
      fecha_nacimiento: "",
      municipio_residencia: "",
      comunidad_indigena: false,
    },
  })

  async function cargarPacientes() {
    try {
      const res = await fetch("/api/vacunador/pacientes")
      const d = await res.json()
      setPacientes(d.pacientes ?? [])
    } catch {
      toast.error("Error al cargar pacientes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void cargarPacientes() }, [])

  async function onSubmit(values: PacienteFormData) {
    setSaving(true)
    try {
      const res = await fetch("/api/vacunador/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error?.message ?? "Error al registrar paciente"); return }
      toast.success("Paciente registrado correctamente")
      setOpen(false)
      form.reset()
      void cargarPacientes()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  const edadTexto = (fechaNac: string) => {
    const dias = Math.floor((Date.now() - new Date(fechaNac).getTime()) / 86400000)
    if (dias < 30) return `${dias} días`
    if (dias < 365) return `${Math.floor(dias / 30)} meses`
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
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filtrar por nombre o CI..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar Paciente</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="nombre_paciente" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre(s) *</FormLabel>
                      <FormControl><Input placeholder="Juan Carlos" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ci_paciente" render={({ field }) => (
                    <FormItem>
                      <FormLabel>CI</FormLabel>
                      <FormControl><Input placeholder="12345678" {...field} value={field.value ?? ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="apellido_paterno" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido paterno *</FormLabel>
                      <FormControl><Input placeholder="Mamani" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="apellido_materno" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido materno</FormLabel>
                      <FormControl><Input placeholder="Quispe" {...field} value={field.value ?? ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="sexo" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Femenino</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="fecha_nacimiento" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de nacimiento *</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="municipio_residencia" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Municipio de residencia</FormLabel>
                    <FormControl><Input placeholder="Santa Cruz de la Sierra" {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="comunidad_indigena" render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Pertenece a comunidad indígena</FormLabel>
                  </FormItem>
                )} />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : "Registrar Paciente"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

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
