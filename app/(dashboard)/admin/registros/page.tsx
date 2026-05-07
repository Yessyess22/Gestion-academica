import { RegistrosAdminTable } from "@/components/dashboard/admin/registros-admin-table"

export default function RegistrosAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registros de Vacunación</h1>
        <p className="text-muted-foreground">Historial nacional completo</p>
      </div>
      <RegistrosAdminTable />
    </div>
  )
}
