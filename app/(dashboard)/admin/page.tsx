import { DashboardAdmin } from "@/components/dashboard/admin/dashboard-admin"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Nacional PAI</h1>
        <p className="text-muted-foreground">Programa Ampliado de Inmunización — Bolivia</p>
      </div>
      <DashboardAdmin />
    </div>
  )
}
