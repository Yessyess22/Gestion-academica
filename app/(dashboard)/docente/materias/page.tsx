 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; 

  import { BookOpen } from "lucide-react"; 

  import MisMaterias from "@/components/dashboard/docente/mis-materias"; 

   

  export default function DocenteMateriasPage() { 

    return ( 

      <div className="flex flex-1 flex-col gap-4 p-4"> 

        <div className="flex items-center gap-3"> 

          <BookOpen className="h-8 w-8 text-primary" /> 

          <div> 

            <h1 className="text-2xl font-bold tracking-tight"> 

              Mis Materias 

            </h1> 

            <p className="text-muted-foreground"> 

              Materias asignadas a tu cuenta de docente 

            </p> 

          </div> 

        </div> 

   

        <Card> 

          <CardHeader> 

            <CardTitle>Materias que dictas</CardTitle> 

            <CardDescription> 

              Aquí verás las materias que el administrador te ha asignado 

            </CardDescription> 

          </CardHeader> 

          <CardContent> 

            <MisMaterias /> 

          </CardContent> 

        </Card> 

      </div> 

    ); 

  } 