import DashboardAdmin from "@/components/dashboard/admin/dashboard-admin";



export default function AdminDashboardPage() {

  return (

    <div className="flex flex-1 flex-col gap-4 p-4">

      <div>

        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

        <p className="text-muted-foreground">

          Panel de administración del sistema

        </p>

      </div>

      <DashboardAdmin />

    </div>

  );

} 