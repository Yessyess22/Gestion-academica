import { LotesTable } from "@/components/dashboard/admin/lotes-table"

export default function LotesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lotes de Vacunas</h1>
        <p className="text-muted-foreground">
          Registra los lotes disponibles para que los vacunadores puedan seleccionarlos al registrar una dosis
        </p>
      </div>
      <LotesTable />
    </div>
  )
}
