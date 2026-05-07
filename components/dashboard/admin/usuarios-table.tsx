"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Shield, UserCheck, UserX, RefreshCw } from "lucide-react"

interface Usuario {
  id: string
  nombre_completo: string
  email: string
  rol: "vacunador" | "coordinador" | "admin"
  establecimiento_id: string | null
  departamento: string | null
  activo: boolean
  created_at: string
}

export function UsuariosTable() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroRol, setFiltroRol] = useState("todos")

  const cargar = async () => {
    setLoading(true)
    const res = await fetch("/api/admin/usuarios")
    const data = await res.json()
    setUsuarios(data.usuarios ?? [])
    setLoading(false)
  }

  useEffect(() => { void cargar() }, [])

  const cambiarRol = async (id: string, rol: string) => {
    const res = await fetch(`/api/admin/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rol }),
    })
    if (res.ok) { toast.success(`Rol actualizado a "${rol}"`); void cargar() }
    else toast.error("Error al cambiar rol")
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    const res = await fetch(`/api/admin/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !activo }),
    })
    if (res.ok) { toast.success(!activo ? "Usuario activado" : "Usuario desactivado"); void cargar() }
    else toast.error("Error al cambiar estado")
  }

  const badgeRol = (rol: string) => {
    const map: Record<string, string> = { admin: "default", coordinador: "secondary", vacunador: "outline" }
    return <Badge variant={(map[rol] ?? "outline") as "default" | "secondary" | "outline"}>{rol}</Badge>
  }

  const filtrados = usuarios.filter((u) => filtroRol === "todos" || u.rol === filtroRol)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={filtroRol} onValueChange={setFiltroRol}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="coordinador">Coordinador</SelectItem>
            <SelectItem value="vacunador">Vacunador</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => void cargar()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refrescar
        </Button>
        <span className="text-sm text-muted-foreground ml-auto">{filtrados.length} usuario(s)</span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Establecimiento / Dpto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Cargando...</TableCell></TableRow>
            ) : filtrados.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sin usuarios</TableCell></TableRow>
            ) : (
              filtrados.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.nombre_completo}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>{badgeRol(u.rol)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.establecimiento_id ?? u.departamento ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.activo ? "default" : "destructive"}>{u.activo ? "Activo" : "Inactivo"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Select onValueChange={(v) => cambiarRol(u.id, v)} value={u.rol}>
                        <SelectTrigger className="w-[140px] h-8">
                          <Shield className="mr-1 h-3 w-3" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vacunador">Vacunador</SelectItem>
                          <SelectItem value="coordinador">Coordinador</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant={u.activo ? "destructive" : "default"} size="sm">
                            {u.activo ? <><UserX className="mr-1 h-3 w-3" />Desactivar</> : <><UserCheck className="mr-1 h-3 w-3" />Activar</>}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{u.activo ? "¿Desactivar usuario?" : "¿Activar usuario?"}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {u.activo ? `${u.nombre_completo} no podrá iniciar sesión.` : `${u.nombre_completo} podrá acceder nuevamente.`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => toggleActivo(u.id, u.activo)}>Confirmar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
