"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription,
  CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { RefreshCw, Users, ChevronDown, ChevronUp } from "lucide-react";

interface Estudiante {
  id: string;
  nombre_completo: string;
}

interface Inscripcion {
  id: string;
  estado: "activa" | "retirada" | "completada";
  created_at: string;
  estudiante: Estudiante;
}

interface MateriaConInscritos {
  id: string;
  codigo: string;
  nombre: string;
  creditos: number;
  semestre: string;
  totalInscritos: number;
  inscripciones: Inscripcion[];
}

export default function MisMaterias() {
  const [materias, setMaterias] = useState<MateriaConInscritos[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/docente/inscripciones");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al cargar datos");
        return;
      }
      setMaterias(data.materias);
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const toggleExpandir = (materiaId: string) => {
    setExpandidas((prev) => {
      const next = new Set(prev);
      if (next.has(materiaId)) next.delete(materiaId);
      else next.add(materiaId);
      return next;
    });
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
        <p className="text-muted-foreground">Cargando materias...</p>
      </div>
    );
  }

  if (materias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <p className="text-muted-foreground">No tienes materias asignadas.</p>
        <Button size="sm" onClick={cargarDatos}><RefreshCw className="mr-2 h-4 w-4" /> Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {materias.length} materia(s) |{" "}
          {materias.reduce((s, m) => s + m.totalInscritos, 0)} estudiante(s) inscrito(s)
        </p>
        <Button variant="outline" size="sm" onClick={cargarDatos}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refrescar
        </Button>
      </div>

      <div className="space-y-3">
        {materias.map((m) => {
          const isExpanded = expandidas.has(m.id);
          return (
            <Card key={m.id}>
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleExpandir(m.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">{m.codigo}</Badge>
                      {m.nombre}
                    </CardTitle>
                    <CardDescription>
                      {m.creditos} créd. | {m.semestre}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={m.totalInscritos > 0 ? "default" : "secondary"}>
                      <Users className="mr-1 h-3 w-3" />
                      {m.totalInscritos} inscrito(s)
                    </Badge>
                    {isExpanded
                      ? <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      : <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    }
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  {m.inscripciones.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Ningún estudiante inscrito aún.
                    </p>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Estudiante</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha inscripción</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {m.inscripciones.map((i) => (
                            <TableRow key={i.id}>
                              <TableCell className="font-medium">
                                {i.estudiante?.nombre_completo || "Usuario sin nombre"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={getBadgeVariant(i.estado)}>
                                  {i.estado.charAt(0).toUpperCase() + i.estado.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(i.created_at).toLocaleDateString("es-BO")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
