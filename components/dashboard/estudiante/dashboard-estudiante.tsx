"use client";



import { useEffect, useState } from "react";

import { toast } from "sonner";

import { StatsCard } from "@/components/dashboard/stats-card";

import { Button } from "@/components/ui/button";

import { BookOpen, GraduationCap, XCircle, Library } from "lucide-react";

import { useRouter } from "next/navigation";



interface Stats {

    materiasInscritas: number;

    materiasRetiradas: number;

    creditosActivos: number;

    totalMateriasDisponibles: number;

}



export default function DashboardEstudiante() {

    const [stats, setStats] = useState<Stats | null>(null);

    const [loading, setLoading] = useState(true);

    const router = useRouter();



    useEffect(() => {

        const cargar = async () => {

            try {

                const res = await fetch("/api/estudiante/stats");

                const data = await res.json();

                if (res.ok) setStats(data.stats);

            } catch {

                toast.error("Error al cargar estadísticas");

            } finally {

                setLoading(false);

            }

        };

        cargar();

    }, []);



    if (loading) {

        return (

            <div className="flex items-center justify-center py-12">

                <p className="text-muted-foreground">Cargando dashboard...</p>

            </div>

        );

    }



    return (

        <div className="space-y-6">

            {/* KPIs */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                <StatsCard

                    title="Materias Inscritas"

                    value={stats?.materiasInscritas ?? 0}

                    icon={BookOpen}

                />

                <StatsCard

                    title="Créditos Activos"

                    value={stats?.creditosActivos ?? 0}

                    icon={GraduationCap}

                />

                <StatsCard

                    title="Materias Retiradas"

                    value={stats?.materiasRetiradas ?? 0}

                    icon={XCircle}

                />

                <StatsCard

                    title="Materias Disponibles"

                    value={stats?.totalMateriasDisponibles ?? 0}

                    icon={Library}

                />

            </div>



            {/* Acciones rápidas */}

            <div className="flex gap-3">

                <Button onClick={() => router.push("/estudiante/materias")}>

                    Ver Catálogo de Materias

                </Button>

                <Button variant="outline" onClick={() => router.push("/estudiante/inscripciones")}>

                    Mis Inscripciones

                </Button>

            </div>

        </div>

    );

}

