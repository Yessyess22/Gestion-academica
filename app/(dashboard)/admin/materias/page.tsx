 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; 

  import { BookOpen } from "lucide-react"; 

  import MateriasTable from "@/components/dashboard/admin/materias-table"; 

   

  export default function AdminMateriasPage() { 

    return ( 

      <div className="flex flex-1 flex-col gap-4 p-4"> 

        {/* Encabezado */} 

        <div className="flex items-center gap-3"> 

          <BookOpen className="h-8 w-8 text-primary" /> 

          <div> 

            <h1 className="text-2xl font-bold tracking-tight"> 

              Gestión de Materias 

            </h1> 

            <p className="text-muted-foreground"> 

              Crea, visualiza y administra las materias del sistema académico. 

            </p> 

          </div> 

        </div> 

   

        {/* Card con la tabla */} 

        <Card> 

          <CardHeader> 

            <CardTitle>Catálogo de Materias</CardTitle> 

            <CardDescription> 

              Listado de todas las materias registradas con su docente asignado 

            </CardDescription> 

          </CardHeader> 

          <CardContent> 

            <MateriasTable /> 

          </CardContent> 

        </Card> 

      </div> 

    ); 

  } 

  