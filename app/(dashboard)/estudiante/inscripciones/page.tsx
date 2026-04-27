  import { 

    Card, CardContent, CardDescription, 

    CardHeader, CardTitle, 

  } from "@/components/ui/card"; 

  import { ClipboardList } from "lucide-react"; 

  import MisInscripciones from "@/components/dashboard/estudiante/mis-inscripciones"; 

   

  export default function EstudianteInscripcionesPage() { 

    return ( 

      <div className="flex flex-1 flex-col gap-4 p-4"> 

        <div className="flex items-center gap-3"> 

          <ClipboardList className="h-8 w-8 text-primary" /> 

          <div> 

            <h1 className="text-2xl font-bold tracking-tight"> 

              Mis Inscripciones 

            </h1> 

            <p className="text-muted-foreground"> 

              Consulta y gestiona tus inscripciones en materias 

            </p> 

          </div> 

        </div> 

   

        <Card> 

          <CardHeader> 

            <CardTitle>Inscripciones Registradas</CardTitle> 

            <CardDescription> 

              Lista de todas las materias en las que te has inscrito 

            </CardDescription> 

          </CardHeader> 

          <CardContent> 

            <MisInscripciones /> 

          </CardContent> 

        </Card> 

      </div> 

    ); 

  } 