"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { perfilSchema, type PerfilFormData } from "@/lib/validations/perfil"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { User, Phone, GraduationCap, Save, Loader2 } from "lucide-react"

export function PerfilForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const form = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nombre_completo: "",
      telefono: "",
      carrera: "",
    },
  })

  async function loadPerfil() {
    try {
      const response = await fetch("/api/auth/perfil")
      const data = await response.json()
      if (response.ok && data.perfil) {
        form.reset({
          nombre_completo: data.perfil.nombre_completo || "",
          telefono: data.perfil.telefono || "",
          carrera: data.perfil.carrera || "",
        })
      }
    } catch {
      toast.error("Error al cargar el perfil")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPerfil()
  }, [])

  async function onSubmit(values: PerfilFormData) {
    setSaving(true)
    try {
      const response = await fetch("/api/auth/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Error al actualizar")
        return
      }

      toast.success("Perfil actualizado exitosamente")
      
      // Forzar refresco de la página y los datos
      router.refresh()
      await loadPerfil()
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
          <p className="text-muted-foreground animate-pulse">Cargando tu información...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl border-none shadow-2xl bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <User className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Mi Perfil</CardTitle>
        </div>
        <CardDescription className="text-base text-muted-foreground">
          Gestiona tu información personal y académica de forma segura.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6">
              {/* ─── Nombre completo ─── */}
              <FormField
                control={form.control}
                name="nombre_completo"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Nombre Completo
                    </FormLabel>
                    <FormControl>
                      <Input 
                        className="h-11 bg-background/50 focus:ring-2 focus:ring-primary/20 transition-all border-muted"
                        placeholder="Ej: Juan Pérez Mamani" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ─── Teléfono ─── */}
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Teléfono
                      </FormLabel>
                      <FormControl>
                        <Input 
                          className="h-11 bg-background/50 focus:ring-2 focus:ring-primary/20 transition-all border-muted"
                          placeholder="+591 7xxxxxxx" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ─── Carrera ─── */}
                <FormField
                  control={form.control}
                  name="carrera"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        Carrera / Cargo
                      </FormLabel>
                      <FormControl>
                        <Input 
                          className="h-11 bg-background/50 focus:ring-2 focus:ring-primary/20 transition-all border-muted"
                          placeholder="Tu carrera profesional" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-bold shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]" 
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
