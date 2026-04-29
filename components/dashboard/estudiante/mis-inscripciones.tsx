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
import { RefreshCw, LogOut } from "lucide-react";

interface Inscripcion {
  id: string;
  estado: "activa" | "retirada" | "completada";
  created_at: string;
  materia: {
    id: string;
    codigo: string;
    nombre: string;
    creditos: number;
    semestre: string;
    docente: {
      nombre_completo: string;
    } | null;
  };
}

export default function MisInscripciones() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [retirando, setRetirando] = useState<string | null>(null);

  const cargarInscripciones = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/estudiante/inscripciones");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al cargar inscripciones");
        return;
      }
      setInscripciones(data.inscripciones);
    } catch {
      toast.error("Error de conexion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarInscripciones();
  }, []);

  const inscripcionesFiltradas = inscripciones.filter((i) => {
    return filtroEstado === "todos" || i.estado === filtroEstado;
  });

  const totalActivas = inscripciones.filter((i) => i.estado === "activa").length;
  const totalRetiradas = inscripciones.filter((i) => i.estado === "retirada").length;
  const totalCreditos = inscripciones
    .filter((i) => i.estado === "activa")
    .reduce((sum, i) => sum + (i.materia?.creditos || 0), 0);

  const retirarInscripcion = async (inscripcion: Inscripcion) => {
    setRetirando(inscripcion.id);
    try {
      const res = await fetch(`/api/estudiante/inscripciones/${inscripcion.id}`, {
        method: "PUT",
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al retirar inscripcion");
        return;
      }

      toast.success(`Inscripcion retirada correctamente`);
      cargarInscripciones();
    } catch {
      toast.error("Error de conexion");
    } finally {
      setRetirando(null);
    }
  };

  const getBadgeVariant = (estado: string) => {
    switch (estado) {
      case "activa": return "default";
      case "completada": return "secondary";
      case "retirada": return "destructive";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando inscripciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 text-sm">
        <span>Activas: <strong className="text-green-600">{totalActivas}</strong></span>
        <span>Retiradas: <strong className="text-red-500">{totalRetiradas}</strong></span>
        <span>Creditos: <strong>{totalCreditos}</strong></span>
      </div>

      <div className="flex items-center gap-4">
        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="activa">Activas</SelectItem>
            <SelectItem value="retirada">Retiradas</SelectItem>
            <SelectItem value="completada">Completadas</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={cargarInscripciones}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refrescar
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Codigo</TableHead>
              <TableHead>Materia</TableHead>
              <TableHead>Creditos</TableHead>
              <TableHead>Docente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Accion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inscripcionesFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No se encontraron inscripciones
                </TableCell>
              </TableRow>
            ) : (
              inscripcionesFiltradas.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono">{i.materia?.codigo}</TableCell>
                  <TableCell className="font-medium">{i.materia?.nombre}</TableCell>
                  <TableCell>{i.materia?.creditos}</TableCell>
                  <TableCell>{i.materia?.docente?.nombre_completo || "Sin asignar"}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(i.estado)}>
                      {i.estado.charAt(0).toUpperCase() + i.estado.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(i.created_at).toLocaleDateString("es-BO")}</TableCell>
                  <TableCell className="text-right">
                    {i.estado === "activa" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                            Retirar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Retiro</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro que deseas retirar la materia {i.materia?.nombre}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => retirarInscripcion(i)}>Confirmar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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
