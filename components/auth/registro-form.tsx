"use client" 

import { useState } from "react" 
import Link from "next/link" 

import { Button } from "@/components/ui/button" 
import { Input } from "@/components/ui/input" 
import { Label } from "@/components/ui/label" 
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
} from "@/components/ui/card" 

export function RegistroForm() { 
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "", 
    nombre_completo: "", 
    rol: "estudiante", 
    carrera: "", 
  }) 
  const [error, setError] = useState<string | null>(null) 
  const [success, setSuccess] = useState(false) 
  const [loading, setLoading] = useState(false) 

  function handleChange( 
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> 
  ) { 
    setFormData((prev) => ({ 
      ...prev, 
      [e.target.name]: e.target.value, 
    })) 
  } 

  async function handleRegistro(e: React.FormEvent) { 
    e.preventDefault() 
    setError(null) 
    setLoading(true) 

    try { 
      // Llamar a nuestra API Route para crear usuario + perfil 
      const response = await fetch("/api/auth/registro", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(formData), 
      }) 

      const data = await response.json() 

      if (!response.ok) { 
        setError(data.error || "Error al registrar") 
        return 
      } 
      // Registro exitoso 
      setSuccess(true) 
    } catch { 
      setError("Error de conexión. Intenta de nuevo.") 
    } finally { 
      setLoading(false) 
    } 
  } 

  // Si el registro fue exitoso, mostrar mensaje de verificación 
  if (success) { 
    return ( 
      <Card> 
        <CardHeader className="text-center"> 
          <CardTitle className="text-2xl text-green-600"> 
            ¡Registro Exitoso! 
          </CardTitle> 
          <CardDescription> 
            Hemos enviado un enlace de verificación a tu correo 
            electrónico. Por favor, revisa tu bandeja de entrada 
            (y la carpeta de spam) para confirmar tu cuenta. 
          </CardDescription> 
        </CardHeader> 
        <CardFooter className="justify-center"> 
          <Link href="/login"> 
            <Button variant="outline">Ir a Iniciar Sesión</Button> 
          </Link> 
        </CardFooter> 
      </Card> 
    ) 
  } 

  return ( 
    <Card> 
      <CardHeader className="text-center"> 
        <CardTitle className="text-2xl">Crear Cuenta</CardTitle> 
        <CardDescription> 
          Completa tus datos para registrarte en el sistema 
        </CardDescription> 
      </CardHeader> 
      <form onSubmit={handleRegistro}> 
        <CardContent className="space-y-4"> 
          {error && ( 
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"> 
              {error} 
            </div> 
          )} 

          <div className="space-y-2"> 
            <Label htmlFor="nombre_completo">Nombre completo</Label> 
            <Input 
              id="nombre_completo" 
              name="nombre_completo" 
              placeholder="Juan Pérez Mamani" 
              value={formData.nombre_completo} 
              onChange={handleChange} 
              required 
              disabled={loading} 
            /> 
          </div> 

          <div className="space-y-2"> 
            <Label htmlFor="email">Correo electrónico</Label> 
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="tu@email.com" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              disabled={loading} 
            /> 
          </div> 

          <div className="space-y-2"> 
            <Label htmlFor="password">Contraseña</Label> 
            <Input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="Mínimo 6 caracteres" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              minLength={6} 
              disabled={loading} 
            /> 
          </div> 

          <div className="space-y-2"> 
            <Label htmlFor="rol">Rol</Label> 
            <select 
              id="rol" 
              name="rol" 
              value={formData.rol} 
              onChange={handleChange} 
              disabled={loading} 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
            > 
              <option value="estudiante">Estudiante</option> 
              <option value="docente">Docente</option> 
              <option value="admin">Administrador</option> 
            </select> 
          </div> 

          <div className="space-y-2"> 
            <Label htmlFor="carrera">Carrera (opcional)</Label> 
            <Input 
              id="carrera" 
              name="carrera" 
              placeholder="Ej: Ingeniería de Sistemas" 
              value={formData.carrera} 
              onChange={handleChange} 
              disabled={loading} 
            /> 
          </div> 
        </CardContent> 
        <CardFooter className="flex flex-col gap-3"> 
          <Button type="submit" className="w-full" disabled={loading}> 
            {loading ? "Registrando..." : "Crear Cuenta"} 
          </Button> 
          <p className="text-sm text-muted-foreground"> 
            ¿Ya tienes cuenta?{" "} 
            <Link href="/login" className="text-primary hover:underline"> 
              Inicia sesión 
            </Link> 
          </p> 
        </CardFooter> 
      </form> 
    </Card> 
  ) 
} 