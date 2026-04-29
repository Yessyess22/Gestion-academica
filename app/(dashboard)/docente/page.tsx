import DashboardDocente from "@/components/dashboard/docente/dashboard-docente";



export default function DocenteDashboardPage() {

  return (

    <div className="flex flex-1 flex-col gap-4 p-4">

      <div>

        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

        <p className="text-muted-foreground">

          Bienvenido a tu panel de docente

        </p>

      </div>

      <DashboardDocente />

    </div>

  );

}

