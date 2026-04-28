"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RefreshCw } from "lucide-react";

interface Inscripcion {
  id: string;
  estado: "inscrito" | "retirado";
  created_at: string;
  estudiante: { id: string; nombre_completo: string };
  materia: {
    id: string; codigo: string; nombre: string;
    creditos: number; semestre: string;
    docente: { nombre_completo: string } | null;
  };
}

export default function InscripcionesTable() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroMateria, setFiltroMateria] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  const cargarInscripciones = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inscripciones");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al cargar inscripciones");
        return;
      }
      setInscripciones(data.inscripciones);
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarInscripciones(); }, []);

  const materiasUnicas = [
    ...new Map(
      inscripciones.map((i) => [i.materia?.id, i.materia])
    ).values(),
  ];

  const inscripcionesFiltradas = inscripciones.filter((i) => {
    const cumpleMateria = filtroMateria === "todos" || i.materia?.id === filtroMateria;
    const cumpleEstado = filtroEstado === "todos" || i.estado === filtroEstado;
    return cumpleMateria && cumpleEstado;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <Select value={filtroMateria} onValueChange={setFiltroMateria}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filtrar por materia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las materias</SelectItem>
            {materiasUnicas.map((m) => m && (
              <SelectItem key={m.id} value={m.id}>
                {m.codigo} - {m.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="inscrito">Inscritos</SelectItem>
            <SelectItem value="retirado">Retirados</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={cargarInscripciones}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refrescar
        </Button>

        <span className="text-sm text-muted-foreground ml-auto">
          {inscripcionesFiltradas.length} inscripción(es)
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estudiante</TableHead>
              <TableHead>Materia</TableHead>
              <TableHead>Créditos</TableHead>
              <TableHead>Semestre</TableHead>
              <TableHead>Docente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Cargando inscripciones...
                </TableCell>
              </TableRow>
            ) : inscripcionesFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No se encontraron inscripciones
                </TableCell>
              </TableRow>
            ) : (
              inscripcionesFiltradas.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">
                    {i.estudiante?.nombre_completo}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {i.materia?.codigo}
                    </Badge>
                    {" "}{i.materia?.nombre}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{i.materia?.creditos}</Badge>
                  </TableCell>
                  <TableCell>{i.materia?.semestre}</TableCell>
                  <TableCell>
                    {i.materia?.docente
                      ? i.materia.docente.nombre_completo
                      : <span className="text-muted-foreground italic">Sin asignar</span>}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={i.estado === "inscrito" ? "default" : "destructive"}
                    >
                      {i.estado.charAt(0).toUpperCase() + i.estado.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(i.created_at).toLocaleDateString("es-BO")}
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