"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Shield, UserCheck, UserX, RefreshCw } from "lucide-react";

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: "estudiante" | "docente" | "admin";
  activo: boolean;
  created_at: string;
}

export default function UsuariosTable() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroRol, setFiltroRol] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  const cargarUsuarios = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/admin/usuarios", { credentials: "same-origin" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al cargar usuarios");
        return;
      }

      setUsuarios(data.usuarios);
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargarUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter((u) => {
    const cumpleRol = filtroRol === "todos" || u.rol === filtroRol;
    const cumpleEstado =
      filtroEstado === "todos" ||
      (filtroEstado === "activo" && u.activo) ||
      (filtroEstado === "inactivo" && !u.activo);
    return cumpleRol && cumpleEstado;
  });

  const cambiarRol = async (id: string, nuevoRol: string) => {
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ rol: nuevoRol }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al cambiar rol");
        return;
      }

      toast.success(`Rol actualizado a "${nuevoRol}"`);
      cargarUsuarios();
    } catch {
      toast.error("Error de conexión");
    }
  };

  const toggleActivo = async (id: string, estadoActual: boolean) => {
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ activo: !estadoActual }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al cambiar estado");
        return;
      }

      toast.success(!estadoActual ? "Usuario activado" : "Usuario desactivado");
      cargarUsuarios();
    } catch {
      toast.error("Error de conexión");
    }
  };

  const badgeRol = (rol: string) => {
    const variantes: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      admin: "default",
      docente: "secondary",
      estudiante: "outline",
    };
    return <Badge variant={variantes[rol] || "outline"}>{rol.charAt(0).toUpperCase() + rol.slice(1)}</Badge>;
  };

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
            <SelectItem value="docente">Docente</SelectItem>
            <SelectItem value="estudiante">Estudiante</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="activo">Activos</SelectItem>
            <SelectItem value="inactivo">Inactivos</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={() => void cargarUsuarios()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refrescar
        </Button>

        <span className="text-sm text-muted-foreground ml-auto">{usuariosFiltrados.length} usuario(s)</span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Cargando usuarios...
                </TableCell>
              </TableRow>
            ) : usuariosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              usuariosFiltrados.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.nombre} {u.apellido}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{badgeRol(u.rol)}</TableCell>
                  <TableCell>
                    <Badge variant={u.activo ? "default" : "destructive"}>{u.activo ? "Activo" : "Inactivo"}</Badge>
                  </TableCell>
                  <TableCell>{new Date(u.created_at).toLocaleDateString("es-BO")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Select onValueChange={(v) => cambiarRol(u.id, v)} value={u.rol}>
                        <SelectTrigger className="w-[130px] h-8">
                          <Shield className="mr-1 h-3 w-3" />
                          <SelectValue placeholder="Rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="estudiante">Estudiante</SelectItem>
                          <SelectItem value="docente">Docente</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant={u.activo ? "destructive" : "default"} size="sm">
                            {u.activo ? (<><UserX className="mr-1 h-3 w-3" /> Desactivar</>) : (<><UserCheck className="mr-1 h-3 w-3" /> Activar</>) }
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{u.activo ? "¿Desactivar usuario?" : "¿Activar usuario?"}</AlertDialogTitle>
                            <AlertDialogDescription>{u.activo ? `${u.nombre} ${u.apellido} no podrá iniciar sesión.` : `${u.nombre} ${u.apellido} podrá acceder nuevamente.`}</AlertDialogDescription>
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
  );
}
