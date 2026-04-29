"use client";



import { useEffect, useState } from "react";

import { toast } from "sonner";

import { StatsCard } from "@/components/dashboard/stats-card";

import { Button } from "@/components/ui/button";

import { BookOpen, Users, GraduationCap, BarChart3 } from "lucide-react";

import { useRouter } from "next/navigation";



interface Stats {

    totalMaterias: number;

    totalCreditos: number;

    totalInscritos: number;

    promedioEstudiantesPorMateria: number;

}



export default function DashboardDocente() {

    const [stats, setStats] = useState<Stats | null>(null);

    const [loading, setLoading] = useState(true);

    const router = useRouter();



    useEffect(() => {

        const cargar = async () => {

            try {

                const res = await fetch("/api/docente/stats");

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                <StatsCard

                    title="Mis Materias"

                    value={stats?.totalMaterias ?? 0}

                    icon={BookOpen}

                />

                <StatsCard

                    title="Total Créditos"

                    value={stats?.totalCreditos ?? 0}

                    icon={GraduationCap}

                />

                <StatsCard

                    title="Estudiantes Inscritos"

                    value={stats?.totalInscritos ?? 0}

                    icon={Users}

                />

                <StatsCard

                    title="Promedio por Materia"

                    value={stats?.promedioEstudiantesPorMateria ?? 0}

                    icon={BarChart3}

                />

            </div>



            <div className="flex gap-3">

                <Button onClick={() => router.push("/docente/materias")}>

                    Ver Mis Materias

                </Button>

            </div>

        </div>

    );

} 