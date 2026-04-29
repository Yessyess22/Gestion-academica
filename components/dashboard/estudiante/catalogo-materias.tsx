"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, ClipboardPlus, CheckCircle2, XCircle } from "lucide-react";
import MateriaCard from "@/components/dashboard/materia-card";

interface Docente {
  nombre_completo: string;
}

interface Materia {
  id: string;
  codigo: string;
  nombre: string;
  creditos: number;
  semestre: string;
  docente: Docente | null;
}

interface Inscripcion {
  id: string;
  estado: "activa" | "retirada" | "completada";
  materia: { id: string };
}

export default function CatalogoMaterias() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroSemestre, setFiltroSemestre] = useState<string>("todos");
  const [inscribiendo, setInscribiendo] = useState<string | null>(null);

  const cargarDatos = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [resMaterias, resInsc] = await Promise.all([
        fetch("/api/estudiante/materias"),
        fetch("/api/estudiante/inscripciones"),
      ]);

      const dataMaterias = await resMaterias.json();
      const dataInsc = await resInsc.json();

      if (resMaterias.ok) setMaterias(dataMaterias.materias);
      if (resInsc.ok) setInscripciones(dataInsc.inscripciones);
    } catch {
      toast.error("Error de conexion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarDatos(true);
  }, []);

  const getEstadoInscripcion = (materiaId: string) => {
    const insc = inscripciones.find((i) => {
        // Manejar tanto objeto como UUID directo segun lo que devuelva la API corregida
        const mid = (i.materia as any)?.id || i.materia;
        return mid === materiaId;
    });
    if (!insc) return "no-inscrito";
    return insc.estado;
  };

  const inscribirse = async (materiaId: string) => {
    setInscribiendo(materiaId);
    try {
      const res = await fetch("/api/estudiante/inscripciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materia_id: materiaId }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al inscribirse");
        return;
      }

      toast.success("Inscripción realizada con éxito");
      cargarDatos(false);
    } catch {
      toast.error("Error al procesar inscripción");
    } finally {
      setInscribiendo(null);
    }
  };

  const semestres = [...new Set(materias.map((m) => m.semestre))].sort();
  const materiasFiltradas = materias.filter(
    (m) => filtroSemestre === "todos" || m.semestre === filtroSemestre
  );

  const renderBotonInscripcion = (materia: Materia) => {
    const estado = getEstadoInscripcion(materia.id);

    if (estado === "activa" || estado === "completada") {
      return (
        <Button variant="outline" size="sm" className="w-full" disabled>
          <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
          {estado === "activa" ? "Inscrito" : "Completada"}
        </Button>
      );
    }

    if (estado === "retirada") {
      return (
        <Button variant="outline" size="sm" className="w-full" disabled>
          <XCircle className="mr-2 h-4 w-4 text-red-500" />
          Retirado
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        className="w-full"
        disabled={inscribiendo === materia.id}
        onClick={() => void inscribirse(materia.id)}
      >
        <ClipboardPlus className="mr-2 h-4 w-4" />
        {inscribiendo === materia.id ? "Inscribiendo..." : "Inscribirme"}
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando catalogo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={filtroSemestre} onValueChange={setFiltroSemestre}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por semestre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los semestres</SelectItem>
            {semestres.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={() => void cargarDatos()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refrescar
        </Button>

        <span className="ml-auto text-sm text-muted-foreground">
          {materiasFiltradas.length} materia(s) | {inscripciones.filter((i) => i.estado === "activa").length} activa(s)
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {materiasFiltradas.map((m) => (
          <MateriaCard
            key={m.id}
            materia={m}
            mostrarDocente={true}
            accion={renderBotonInscripcion(m)}
          />
        ))}
      </div>
    </div>
  );
}
