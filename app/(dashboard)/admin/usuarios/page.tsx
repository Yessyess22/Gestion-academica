import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsuariosTable } from "@/components/dashboard/admin/usuarios-table"

export default function AdminUsuariosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">Administra vacunadores, coordinadores y administradores del sistema PAI</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Usuarios registrados</CardTitle>
          <CardDescription>Asigna roles y establecimientos a cada usuario</CardDescription>
        </CardHeader>
        <CardContent>
          <UsuariosTable />
        </CardContent>
      </Card>
    </div>
  )
}
