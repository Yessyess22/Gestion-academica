import { ReportesAdmin } from "@/components/dashboard/admin/reportes-admin"

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reportes de Cobertura</h1>
        <p className="text-muted-foreground">Análisis de cobertura por departamento y vacuna</p>
      </div>
      <ReportesAdmin />
    </div>
  )
}
