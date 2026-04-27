import { 

    Card, CardContent, CardDescription, 

    CardHeader, CardTitle, 

  } from "@/components/ui/card"; 

  import { ClipboardList } from "lucide-react"; 

  import InscripcionesTable from "@/components/dashboard/admin/inscripciones-table"; 

   

  export default function AdminInscripcionesPage() { 

    return ( 

      <div className="flex flex-1 flex-col gap-4 p-4"> 

        <div className="flex items-center gap-3"> 

          <ClipboardList className="h-8 w-8 text-primary" /> 

          <div> 

            <h1 className="text-2xl font-bold tracking-tight"> 

              Inscripciones del Sistema 

            </h1> 

            <p className="text-muted-foreground"> 

              Visión completa de todas las inscripciones registradas 

            </p> 

          </div> 

        </div> 

   

        <Card> 

          <CardHeader> 

            <CardTitle>Registro de Inscripciones</CardTitle> 

            <CardDescription> 

              Todas las inscripciones con datos de estudiante, materia y docente 

            </CardDescription> 

          </CardHeader> 

          <CardContent> 

            <InscripcionesTable /> 

          </CardContent> 

        </Card> 

      </div> 

    ); 

  } 