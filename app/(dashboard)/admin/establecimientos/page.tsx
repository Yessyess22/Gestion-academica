import { EstablecimientosTable } from "@/components/dashboard/admin/establecimientos-table"

export default function EstablecimientosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Establecimientos de Salud</h1>
        <p className="text-muted-foreground">Red SNIS — gestión de establecimientos del PAI</p>
      </div>
      <EstablecimientosTable />
    </div>
  )
}
