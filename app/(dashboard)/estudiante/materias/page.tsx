  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; 

  import { BookOpen } from "lucide-react"; 

  import CatalogoMaterias from "@/components/dashboard/estudiante/catalogo-materias"; 

   

  export default function EstudianteMateriasPage() { 

    return ( 

      <div className="flex flex-1 flex-col gap-4 p-4"> 

        <div className="flex items-center gap-3"> 

          <BookOpen className="h-8 w-8 text-primary" /> 

          <div> 

            <h1 className="text-2xl font-bold tracking-tight"> 

              Materias Disponibles 

            </h1> 

            <p className="text-muted-foreground"> 

              Explora las materias disponibles para inscripción 

            </p> 

          </div> 

        </div> 

   

        <Card> 

          <CardHeader> 

            <CardTitle>Catálogo de Materias</CardTitle> 

            <CardDescription> 

              Selecciona las materias en las que deseas inscribirte 

            </CardDescription> 

          </CardHeader> 

          <CardContent> 

            <CatalogoMaterias /> 

          </CardContent> 

        </Card> 

      </div> 

    ); 

  } 