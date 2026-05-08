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
    rol: "vacunador",
    ci: "",
    establecimiento_id: "",
    departamento: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Error al registrar"); return }
      setSuccess(true)
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-600">¡Registro Exitoso!</CardTitle>
          <CardDescription>
            Tu cuenta ha sido creada. Ya puedes iniciar sesión con tus credenciales.
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
        <CardTitle className="text-2xl">Crear Cuenta PAI</CardTitle>
        <CardDescription>Registro de personal del sistema de vacunación</CardDescription>
      </CardHeader>
      <form onSubmit={handleRegistro}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombre_completo">Nombre completo *</Label>
            <Input
              id="nombre_completo" name="nombre_completo"
              placeholder="Juan Mamani Quispe"
              value={formData.nombre_completo}
              onChange={handleChange} required disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ci">Cédula de identidad</Label>
            <Input
              id="ci" name="ci"
              placeholder="12345678 LP"
              value={formData.ci}
              onChange={handleChange} disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico *</Label>
            <Input
              id="email" name="email" type="email"
              placeholder="tu@salud.gob.bo"
              value={formData.email}
              onChange={handleChange} required disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña *</Label>
            <Input
              id="password" name="password" type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange} required minLength={6} disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol">Rol *</Label>
            <select
              id="rol" name="rol"
              value={formData.rol}
              onChange={handleChange}
              disabled={loading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="vacunador">Vacunador</option>
              <option value="coordinador">Coordinador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {formData.rol === "vacunador" && (
            <div className="space-y-2">
              <Label htmlFor="establecimiento_id">ID Establecimiento</Label>
              <Input
                id="establecimiento_id" name="establecimiento_id"
                placeholder="EST-SC-0001"
                value={formData.establecimiento_id}
                onChange={handleChange} disabled={loading}
              />
            </div>
          )}

          {formData.rol === "coordinador" && (
            <div className="space-y-2">
              <Label htmlFor="departamento">Departamento</Label>
              <select
                id="departamento" name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                disabled={loading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecciona departamento</option>
                <option value="Beni">Beni</option>
                <option value="Chuquisaca">Chuquisaca</option>
                <option value="Cochabamba">Cochabamba</option>
                <option value="La Paz">La Paz</option>
                <option value="Oruro">Oruro</option>
                <option value="Pando">Pando</option>
                <option value="Potosí">Potosí</option>
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="Tarija">Tarija</option>
              </select>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registrando..." : "Crear Cuenta"}
          </Button>
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline">Inicia sesión</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
