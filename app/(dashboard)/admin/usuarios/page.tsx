  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; 

  import { Users } from "lucide-react"; 

  import UsuariosTable from "@/components/dashboard/admin/usuarios-table"; 

   

  export default function AdminUsuariosPage() { 

    return ( 

      <div className="flex flex-1 flex-col gap-4 p-4"> 

        {/* Encabezado */} 

        <div className="flex items-center gap-3"> 

          <Users className="h-8 w-8 text-primary" /> 

          <div> 

            <h1 className="text-2xl font-bold tracking-tight"> 

              Gestión de Usuarios 

            </h1> 

            <p className="text-muted-foreground"> 

              Administra los usuarios del sistema, cambia roles y activa o 

              desactiva cuentas. 

            </p> 

          </div> 

        </div> 

   

        {/* Card con la tabla */} 

        <Card> 

          <CardHeader> 

            <CardTitle>Usuarios registrados</CardTitle> 

            <CardDescription> 

              Lista completa de todos los usuarios del sistema 

            </CardDescription> 

          </CardHeader> 

          <CardContent> 

            <UsuariosTable /> 

          </CardContent> 

        </Card> 

      </div> 

    ); 

  } 