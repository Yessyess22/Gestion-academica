"use client" 

  

import { useEffect, useState } from "react" 

import { useForm } from "react-hook-form" 

import { zodResolver } from "@hookform/resolvers/zod" 

import { toast } from "sonner" 

  

import { perfilSchema, type PerfilFormData } from "@/lib/validations/perfil" 

  

import { Button } from "@/components/ui/button" 

import { Input } from "@/components/ui/input" 

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

  

export function PerfilForm() { 

  const [loading, setLoading] = useState(true) 

  const [saving, setSaving] = useState(false) 

  

  // 1. Configurar React Hook Form con Zod 

  const form = useForm<PerfilFormData>({ 

    resolver: zodResolver(perfilSchema), 

    defaultValues: { 

      nombre_completo: "", 

      telefono: "", 

      carrera: "", 

    }, 

  }) 

  

  // 2. Cargar datos actuales del perfil 

  useEffect(() => { 

    async function loadPerfil() { 

      try { 

        const response = await fetch("/api/auth/perfil", { credentials: "same-origin" }) 

        const data = await response.json() 

  

        if (response.ok && data.perfil) { 

          // Prellenar el formulario con datos existentes 

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

    loadPerfil()

  }, [form]) 

  

  // 3. Enviar datos actualizados 

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

    } catch { 

      toast.error("Error de conexión") 

    } finally { 

      setSaving(false) 

    } 

  } 

  

  if (loading) { 

    return ( 

      <Card className="max-w-2xl"> 

        <CardContent className="p-6"> 

          <p className="text-muted-foreground">Cargando perfil...</p> 

        </CardContent> 

      </Card> 

    ) 

  } 

  

  return ( 

    <Card className="max-w-2xl"> 

      <CardHeader> 

        <CardTitle>Mi Perfil</CardTitle> 

        <CardDescription> 

          Actualiza tu información personal 

        </CardDescription> 

      </CardHeader> 

      <CardContent> 

        <Form {...form}> 

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6"> 

            {/* ─── Nombre completo ─── */} 

            <FormField 

              control={form.control} 

              name="nombre_completo" 

              render={({ field }) => ( 

                <FormItem> 

                  <FormLabel>Nombre completo</FormLabel> 

                  <FormControl> 

                    <Input 

                      placeholder="Juan Pérez Mamani" 

                      {...field} 

                    /> 

                  </FormControl> 

                  <FormMessage /> 

                </FormItem> 

              )} 

            /> 

  

            {/* ─── Teléfono ─── */} 

            <FormField 

              control={form.control} 

              name="telefono" 

              render={({ field }) => ( 

                <FormItem> 

                  <FormLabel>Teléfono (opcional)</FormLabel> 

                  <FormControl> 

                    <Input 

                      placeholder="+591 7xxxxxxx" 

                      {...field} 

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

                <FormItem> 

                  <FormLabel>Carrera (opcional)</FormLabel> 

                  <FormControl> 

                    <Input 

                      placeholder="Ingeniería de Sistemas" 

                      {...field} 

                    /> 

                  </FormControl> 

                  <FormMessage /> 

                </FormItem> 

              )} 

            /> 

  

            {/* ─── Botón guardar ─── */} 

            <Button type="submit" disabled={saving}> 

              {saving ? "Guardando..." : "Guardar Cambios"} 

            </Button> 

          </form> 

        </Form> 

      </CardContent> 

    </Card> 

  ) 

} 