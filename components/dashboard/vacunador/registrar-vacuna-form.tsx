"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registroVacunacionSchema, type RegistroVacunacionFormData } from "@/lib/validations/registro-vacunacion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Search } from "lucide-react"

interface Paciente {
  paciente_id: string
  nombre_paciente: string
  apellido_paterno: string
  apellido_materno: string
  fecha_nacimiento: string
  sexo: string
}

interface Vacuna {
  vacuna_id: string
  vacuna_nombre: string
  dosis_descripcion: string
  via_administracion: string
}

interface Lote {
  lote_id: string
  lote_codigo: string
  fecha_vencimiento: string
  cantidad_dosis: number
}

interface EstablecimientoInfo {
  nombre_establecimiento: string
  departamento: string
}

export function RegistrarVacunaForm() {
  const [buscandoCI, setBuscandoCI] = useState("")
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null)
  const [pacientesEncontrados, setPacientesEncontrados] = useState<Paciente[]>([])
  const [vacunas, setVacunas] = useState<Vacuna[]>([])
  const [lotes, setLotes] = useState<Lote[]>([])
  const [establecimientoInfo, setEstablecimientoInfo] = useState<EstablecimientoInfo | null>(null)
  const [cargandoLotes, setCargandoLotes] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const form = useForm<RegistroVacunacionFormData>({
    resolver: zodResolver(registroVacunacionSchema),
    defaultValues: {
      fecha_vacunacion: new Date().toISOString().split("T")[0],
      aplicacion_oportuna: null,
    },
  })

  async function buscarPaciente() {
    if (!buscandoCI.trim()) return
    setBuscando(true)
    try {
      const res = await fetch(`/api/vacunador/pacientes?ci=${encodeURIComponent(buscandoCI)}`)
      const data = await res.json()
      setPacientesEncontrados(data.pacientes ?? [])
    } catch {
      toast.error("Error al buscar paciente")
    } finally {
      setBuscando(false)
    }
  }

  async function seleccionarPaciente(p: Paciente) {
    setPacienteSeleccionado(p)
    form.setValue("paciente_id", p.paciente_id)
    setPacientesEncontrados([])
    if (vacunas.length === 0) {
      try {
        const res = await fetch("/api/vacunador/vacunas")
        const data = await res.json()
        setVacunas(data.vacunas ?? [])
        if (data.establecimiento) setEstablecimientoInfo(data.establecimiento)
      } catch {
        toast.error("Error al cargar vacunas")
      }
    }
  }

  async function handleVacunaChange(vacunaId: string) {
    form.setValue("vacuna_id", vacunaId)
    form.setValue("lote_vacuna", "")
    const v = vacunas.find((x) => x.vacuna_id === vacunaId)
    if (v) form.setValue("via_administracion", v.via_administracion)

    setLotes([])
    setCargandoLotes(true)
    try {
      const res = await fetch(`/api/vacunador/lotes?vacuna_id=${encodeURIComponent(vacunaId)}`)
      const data = await res.json()
      setLotes(data.lotes ?? [])
    } catch {
      toast.error("Error al cargar lotes")
    } finally {
      setCargandoLotes(false)
    }
  }

  async function onSubmit(values: RegistroVacunacionFormData) {
    setEnviando(true)
    try {
      const res = await fetch("/api/vacunador/registros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (res.ok) {
        toast.success("Vacunación registrada exitosamente")
        form.reset({ fecha_vacunacion: new Date().toISOString().split("T")[0] })
        setPacienteSeleccionado(null)
        setLotes([])
      } else {
        const err = await res.json()
        toast.error(err.error ?? "Error al registrar")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setEnviando(false)
    }
  }

  const edadTexto = (fechaNac: string) => {
    const dias = Math.floor((Date.now() - new Date(fechaNac).getTime()) / 86400000)
    if (dias < 30) return `${dias} días`
    if (dias < 365) return `${Math.floor(dias / 30)} meses`
    return `${Math.floor(dias / 365)} años`
  }

  const vacunaSeleccionada = form.watch("vacuna_id")

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Paso 1 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Buscar paciente por CI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Ej: 12345678 SC"
              value={buscandoCI}
              onChange={(e) => setBuscandoCI(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscarPaciente()}
            />
            <Button variant="outline" onClick={buscarPaciente} disabled={buscando}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {pacientesEncontrados.length > 0 && (
            <div className="border rounded-md divide-y">
              {pacientesEncontrados.map((p) => (
                <button
                  key={p.paciente_id}
                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                  onClick={() => seleccionarPaciente(p)}
                >
                  <span className="font-medium">
                    {p.nombre_paciente} {p.apellido_paterno} {p.apellido_materno}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    — {edadTexto(p.fecha_nacimiento)} — {p.sexo === "M" ? "Masculino" : "Femenino"}
                  </span>
                </button>
              ))}
            </div>
          )}

          {pacienteSeleccionado && (
            <div className="rounded-md bg-primary/10 border border-primary/20 px-3 py-2 text-sm">
              <span className="font-medium text-primary">Paciente: </span>
              {pacienteSeleccionado.nombre_paciente} {pacienteSeleccionado.apellido_paterno}
              {" — "}{edadTexto(pacienteSeleccionado.fecha_nacimiento)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paso 2 */}
      {pacienteSeleccionado && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. Datos de la vacunación</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Establecimiento y departamento (solo lectura) */}
            {establecimientoInfo && (
              <div className="grid grid-cols-2 gap-3 mb-4 rounded-md bg-muted/50 border px-3 py-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Establecimiento: </span>
                  <span className="font-medium">{establecimientoInfo.nombre_establecimiento}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Departamento: </span>
                  <span className="font-medium">{establecimientoInfo.departamento}</span>
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                {/* Vacuna */}
                <FormField
                  control={form.control}
                  name="vacuna_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vacuna</FormLabel>
                      <Select onValueChange={handleVacunaChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona la vacuna" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vacunas.map((v) => (
                            <SelectItem key={v.vacuna_id} value={v.vacuna_id}>
                              {v.vacuna_nombre} — {v.dosis_descripcion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Fecha */}
                  <FormField
                    control={form.control}
                    name="fecha_vacunacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de aplicación</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Lote — siempre Select */}
                  <FormField
                    control={form.control}
                    name="lote_vacuna"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lote de vacuna</FormLabel>
                        {!vacunaSeleccionada ? (
                          <Input disabled placeholder="Primero selecciona la vacuna" className="cursor-not-allowed" />
                        ) : cargandoLotes ? (
                          <Skeleton className="h-9 w-full" />
                        ) : lotes.length === 0 ? (
                          <div className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
                            Sin lotes registrados — pide al admin que agregue lotes para esta vacuna
                          </div>
                        ) : (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el lote" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {lotes.map((l) => (
                                <SelectItem key={l.lote_id} value={l.lote_codigo}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{l.lote_codigo}</span>
                                    <span className="text-xs text-muted-foreground">
                                      Vence: {new Date(l.fecha_vencimiento).toLocaleDateString("es-BO")}
                                      {l.cantidad_dosis ? ` · ${l.cantidad_dosis} dosis` : ""}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Temperatura */}
                  <FormField
                    control={form.control}
                    name="temperatura_conservacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperatura conservación (°C)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Ej: 5.2"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Vía */}
                  <FormField
                    control={form.control}
                    name="via_administracion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vía de administración</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Intramuscular" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Aplicación oportuna */}
                <FormField
                  control={form.control}
                  name="aplicacion_oportuna"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aplicación oportuna</FormLabel>
                      <Select
                        onValueChange={(v) =>
                          field.onChange(v === "null" ? null : v === "true")
                        }
                        value={field.value === null || field.value === undefined ? "null" : String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">No determinado</SelectItem>
                          <SelectItem value="true">Sí — dentro del calendario</SelectItem>
                          <SelectItem value="false">No — fuera de fecha</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={enviando} className="w-full">
                  {enviando ? "Registrando..." : "Registrar vacunación"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
