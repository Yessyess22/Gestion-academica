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
  estado: "inscrito" | "retirado";
  created_at: string;
  materia: {
    id: string;
    codigo: string;
    nombre: string;
    creditos: number;
    semestre: string;
    docente: {
      nombre: string;
      apellido: string;
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
      const res = await fetch("/api/estudiante/inscripciones", { credentials: "same-origin" });
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarInscripciones();
  }, []);

  const inscripcionesFiltradas = inscripciones.filter((i) => {
    return filtroEstado === "todos" || i.estado === filtroEstado;
  });

  const totalInscritas = inscripciones.filter((i) => i.estado === "inscrito").length;
  const totalRetiradas = inscripciones.filter((i) => i.estado === "retirado").length;
  const totalCreditos = inscripciones
    .filter((i) => i.estado === "inscrito")
    .reduce((sum, i) => sum + (i.materia?.creditos || 0), 0);

  const retirarInscripcion = async (inscripcion: Inscripcion) => {
    setRetirando(inscripcion.id);
    try {
      const res = await fetch(`/api/estudiante/inscripciones/${inscripcion.id}`, {
        method: "PUT",
        credentials: "same-origin",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al retirar inscripcion");
        return;
      }

      toast.success(
        `Inscripcion retirada: ${inscripcion.materia.codigo} - ${inscripcion.materia.nombre}`
      );

      setInscripciones((prev) =>
        prev.map((i) =>
          i.id === inscripcion.id ? { ...i, estado: "retirado" as const } : i
        )
      );
    } catch {
      toast.error("Error de conexion");
    } finally {
      setRetirando(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando inscripciones...</p>
      </div>
    );
  }

  if (inscripciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12">
        <p className="text-muted-foreground">No tienes inscripciones aun.</p>
        <p className="text-sm text-muted-foreground">
          Ve al catalogo de materias para inscribirte.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 text-sm">
        <span>
          Inscritas: <strong className="text-green-600">{totalInscritas}</strong>
        </span>
        <span>
          Retiradas: <strong className="text-red-500">{totalRetiradas}</strong>
        </span>
        <span>
          Creditos activos: <strong>{totalCreditos}</strong>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="inscrito">Inscritas</SelectItem>
            <SelectItem value="retirado">Retiradas</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={cargarInscripciones}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refrescar
        </Button>

        <span className="ml-auto text-sm text-muted-foreground">
          {inscripcionesFiltradas.length} inscripcion(es)
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Codigo</TableHead>
              <TableHead>Materia</TableHead>
              <TableHead>Creditos</TableHead>
              <TableHead>Semestre</TableHead>
              <TableHead>Docente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Accion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inscripcionesFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center">
                  No se encontraron inscripciones
                </TableCell>
              </TableRow>
            ) : (
              inscripcionesFiltradas.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono font-medium">{i.materia?.codigo}</TableCell>
                  <TableCell>{i.materia?.nombre}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{i.materia?.creditos}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{i.materia?.semestre}</Badge>
                  </TableCell>
                  <TableCell>
                    {i.materia?.docente ? (
                      `${i.materia.docente.nombre} ${i.materia.docente.apellido}`
                    ) : (
                      <span className="italic text-muted-foreground">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={i.estado === "inscrito" ? "default" : "destructive"}>
                      {i.estado.charAt(0).toUpperCase() + i.estado.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(i.created_at).toLocaleDateString("es-BO")}</TableCell>
                  <TableCell className="text-right">
                    {i.estado === "inscrito" ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={retirando === i.id}>
                            <LogOut className="mr-1 h-3 w-3" />
                            {retirando === i.id ? "Retirando..." : "Retirar"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Retirar inscripcion?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Estas a punto de retirarte de <strong>{i.materia?.codigo} - {i.materia?.nombre}</strong>.
                              Esta accion es permanente y no podras volver a inscribirte en esta materia.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => retirarInscripcion(i)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Confirmar retiro
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <span className="text-sm italic text-muted-foreground">Retirada</span>
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