"use client" 

import { useState } from "react" 
import { useRouter } from "next/navigation" 
import Link from "next/link" 
import { createClient } from "@/lib/supabase/client" 

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

export function LoginForm() { 
  const router = useRouter() 
  const [email, setEmail] = useState("") 
  const [password, setPassword] = useState("") 
  const [error, setError] = useState<string | null>(null) 
  const [loading, setLoading] = useState(false) 

  async function handleLogin(e: React.FormEvent) { 
    e.preventDefault() 
    setError(null) 
    setLoading(true) 

    try { 
      const supabase = createClient() 

      // 1. Autenticar con Supabase 
      const { error: authError } = await supabase.auth.signInWithPassword({ 
        email, 
        password, 
      }) 

      if (authError) { 
        setError(authError.message) 
        return 
      } 

      // 2. Obtener el perfil del usuario para saber su rol 
      const { data: { user } } = await supabase.auth.getUser() 

      if (!user) { 
        setError("No se pudo obtener el usuario") 
        return 
      } 

      const { data: perfil } = await supabase 
        .from("usuarios_perfil") 
        .select("rol") 
        .eq("id", user.id) 
        .single() 

      // 3. Redirigir según el rol 
      if (perfil) { 
        switch (perfil.rol) { 
          case "estudiante": 
            router.push("/estudiante") 
            break 
          case "docente": 
            router.push("/docente") 
            break 
          case "admin": 
            router.push("/admin") 
            break 
          default: 
            router.push("/") 
        } 
      } else { 
        router.push("/") 
      } 

      // 4. Forzar refresh para que proxy.ts actualice cookies 
      router.refresh() 
    } catch { 
      setError("Error inesperado. Intenta de nuevo.") 
    } finally { 
      setLoading(false) 
    } 
  } 
  
  return ( 
    <Card> 
      <CardHeader className="text-center"> 
        <CardTitle className="text-2xl">Gestión Académica</CardTitle> 
        <CardDescription> 
          Ingresa tus credenciales para acceder al sistema 
        </CardDescription> 
      </CardHeader> 
      <form onSubmit={handleLogin}> 
        <CardContent className="space-y-4"> 
          {error && ( 
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"> 
              {error} 
            </div> 
          )} 
          <div className="space-y-2"> 
            <Label htmlFor="email">Correo electrónico</Label> 
            <Input 
              id="email" 
              type="email" 
              placeholder="tu@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              disabled={loading} 
            /> 
          </div> 
          <div className="space-y-2"> 
            <Label htmlFor="password">Contraseña</Label> 
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={6} 
              disabled={loading} 
            /> 
          </div> 
        </CardContent> 
        <CardFooter className="flex flex-col gap-3"> 
          <Button type="submit" className="w-full" disabled={loading}> 
            {loading ? "Ingresando..." : "Iniciar Sesión"} 
          </Button> 
          <p className="text-sm text-muted-foreground"> 
            ¿No tienes cuenta?{" "} 
            <Link href="/registro" className="text-primary hover:underline"> 
              Regístrate aquí 
            </Link> 
          </p> 
        </CardFooter> 
      </form> 
    </Card> 
  ) 
} 