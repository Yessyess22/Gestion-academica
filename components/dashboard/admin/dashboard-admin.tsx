"use client";



import { useEffect, useState } from "react";

import { toast } from "sonner";

import { StatsCard } from "@/components/dashboard/stats-card";

import { Button } from "@/components/ui/button";

import {

    Users, BookOpen, ClipboardList, UserCheck,

    UserX, GraduationCap, Shield, CheckCircle2,

} from "lucide-react";

import { useRouter } from "next/navigation";



interface Stats {

    totalUsuarios: number;

    totalEstudiantes: number;

    totalDocentes: number;

    totalAdmins: number;

    totalActivos: number;

    totalInactivos: number;

    totalMaterias: number;

    totalInscripciones: number;

    inscripcionesActivas: number;

}



export default function DashboardAdmin() {

    const [stats, setStats] = useState<Stats | null>(null);

    const [loading, setLoading] = useState(true);

    const router = useRouter();



    useEffect(() => {

        const cargar = async () => {

            try {

                const res = await fetch("/api/admin/stats");

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

            {/* Fila 1: Usuarios */}

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">

                <StatsCard title="Usuarios" value={stats?.totalUsuarios ?? 0} icon={Users} />

                <StatsCard title="Estudiantes" value={stats?.totalEstudiantes ?? 0} icon={GraduationCap} />

                <StatsCard title="Docentes" value={stats?.totalDocentes ?? 0} icon={BookOpen} />

                <StatsCard title="Admins" value={stats?.totalAdmins ?? 0} icon={Shield} />

                <StatsCard title="Activos" value={stats?.totalActivos ?? 0} icon={UserCheck} />

                <StatsCard title="Inactivos" value={stats?.totalInactivos ?? 0} icon={UserX} />

            </div>



            {/* Fila 2: Materias e inscripciones */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <StatsCard title="Materias" value={stats?.totalMaterias ?? 0} icon={BookOpen} />

                <StatsCard title="Inscripciones" value={stats?.totalInscripciones ?? 0} icon={ClipboardList} />

                <StatsCard title="Inscripciones Activas" value={stats?.inscripcionesActivas ?? 0} icon={CheckCircle2} />

            </div>



            {/* Acciones rápidas */}

            <div className="flex gap-3 flex-wrap">

                <Button onClick={() => router.push("/admin/usuarios")}>Gestionar Usuarios</Button>

                <Button variant="outline" onClick={() => router.push("/admin/materias")}>Gestionar Materias</Button>

                <Button variant="outline" onClick={() => router.push("/admin/inscripciones")}>Ver Inscripciones</Button>

            </div>

        </div>

    );

} 