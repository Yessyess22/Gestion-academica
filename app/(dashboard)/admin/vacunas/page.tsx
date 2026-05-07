import { VacunasTable } from "@/components/dashboard/admin/vacunas-table"

export default function VacunasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Catálogo Vacunas PAI</h1>
        <p className="text-muted-foreground">Esquema oficial de vacunación del Ministerio de Salud — Bolivia</p>
      </div>
      <VacunasTable />
    </div>
  )
}
