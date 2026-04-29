import DashboardEstudiante from "@/components/dashboard/estudiante/dashboard-estudiante";



export default function EstudianteDashboardPage() {

  return (

    <div className="flex flex-1 flex-col gap-4 p-4">

      <div>

        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

        <p className="text-muted-foreground">

          Bienvenido a tu panel de estudiante

        </p>

      </div>

      <DashboardEstudiante />

    </div>

  );

} 