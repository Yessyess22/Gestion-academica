"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { perfilSchema, type PerfilFormData } from "@/lib/validations/perfil"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { User, Phone, Save, Loader2 } from "lucide-react"

export function PerfilForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const form = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: { nombre_completo: "", telefono: "" },
  })

  async function loadPerfil() {
    try {
      const res = await fetch("/api/auth/perfil")
      const data = await res.json()
      if (res.ok && data.perfil) {
        form.reset({
          nombre_completo: data.perfil.nombre_completo || "",
          telefono: data.perfil.telefono || "",
        })
      }
    } catch {
      toast.error("Error al cargar el perfil")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadPerfil() }, [])

  async function onSubmit(values: PerfilFormData) {
    setSaving(true)
    try {
      const res = await fetch("/api/auth/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Error al actualizar"); return }
      toast.success("Perfil actualizado")
      router.refresh()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="max-w-2xl border-none shadow-lg">
        <CardContent className="p-12 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Cargando...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <CardTitle>Mi Perfil</CardTitle>
        </div>
        <CardDescription>Actualiza tu información personal</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre_completo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" /> Nombre completo
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" /> Teléfono
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="+591 7xxxxxxx" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : <><Save className="mr-2 h-4 w-4" />Guardar cambios</>}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
