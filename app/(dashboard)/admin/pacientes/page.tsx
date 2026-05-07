import { PacientesAdminTable } from "@/components/dashboard/admin/pacientes-admin-table"

export default function PacientesAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
        <p className="text-muted-foreground">Registro nacional de pacientes vacunados</p>
      </div>
      <PacientesAdminTable />
    </div>
  )
}
