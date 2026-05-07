"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registroVacunacionSchema, type RegistroVacunacionFormData } from "@/lib/validations/registro-vacunacion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  grupo_pai: string
  via_administracion: string
}

export function RegistrarVacunaForm() {
  const [buscandoCI, setBuscandoCI] = useState("")
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null)
  const [pacientesEncontrados, setPacientesEncontrados] = useState<Paciente[]>([])
  const [vacunas, setVacunas] = useState<Vacuna[]>([])
  const [buscando, setBuscando] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const form = useForm<RegistroVacunacionFormData>({
    resolver: zodResolver(registroVacunacionSchema),
    defaultValues: {
      fecha_vacunacion: new Date().toISOString().split("T")[0],
    },
  })

  async function buscarPaciente() {
    if (!buscandoCI.trim()) return
    setBuscando(true)
    const res = await fetch(`/api/vacunador/pacientes?ci=${encodeURIComponent(buscandoCI)}`)
    const data = await res.json()
    setPacientesEncontrados(data.pacientes ?? [])
    setBuscando(false)
  }

  async function seleccionarPaciente(p: Paciente) {
    setPacienteSeleccionado(p)
    form.setValue("paciente_id", p.paciente_id)
    setPacientesEncontrados([])
    if (vacunas.length === 0) {
      const res = await fetch("/api/vacunador/vacunas")
      const data = await res.json()
      setVacunas(data.vacunas ?? [])
    }
  }

  async function onSubmit(values: RegistroVacunacionFormData) {
    setEnviando(true)
    const res = await fetch("/api/vacunador/registros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
    setEnviando(false)
    if (res.ok) {
      toast.success("Vacunación registrada exitosamente")
      form.reset({ fecha_vacunacion: new Date().toISOString().split("T")[0] })
      setPacienteSeleccionado(null)
    } else {
      const err = await res.json()
      toast.error(err.error ?? "Error al registrar")
    }
  }

  const edadTexto = (fechaNac: string) => {
    const dias = Math.floor((Date.now() - new Date(fechaNac).getTime()) / 86400000)
    if (dias < 365) return `${dias} días`
    if (dias < 730) return `${Math.floor(dias / 30)} meses`
    return `${Math.floor(dias / 365)} años`
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Búsqueda de paciente */}
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
                  <span className="font-medium">{p.nombre_paciente} {p.apellido_paterno} {p.apellido_materno}</span>
                  <span className="text-muted-foreground ml-2">— {edadTexto(p.fecha_nacimiento)} — {p.sexo === "M" ? "Masculino" : "Femenino"}</span>
                </button>
              ))}
            </div>
          )}

          {pacienteSeleccionado && (
            <div className="rounded-md bg-primary/10 border border-primary/20 px-3 py-2 text-sm">
              <span className="font-medium text-primary">Paciente seleccionado: </span>
              {pacienteSeleccionado.nombre_paciente} {pacienteSeleccionado.apellido_paterno} — {edadTexto(pacienteSeleccionado.fecha_nacimiento)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario de vacunación */}
      {pacienteSeleccionado && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. Datos de la vacunación</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="vacuna_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vacuna</FormLabel>
                      <Select onValueChange={(val) => {
                        field.onChange(val)
                        const v = vacunas.find((x) => x.vacuna_id === val)
                        if (v) form.setValue("via_administracion", v.via_administracion)
                      }} value={field.value}>
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

                  <FormField
                    control={form.control}
                    name="lote_vacuna"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lote de vacuna</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: LOT-BCG-2024-152" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
