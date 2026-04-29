 import { 

    Card, CardContent, CardDescription, 

    CardFooter, CardHeader, CardTitle, 

  } from "@/components/ui/card"; 

  import { Badge } from "@/components/ui/badge"; 

  import { BookOpen, User, GraduationCap } from "lucide-react"; 

   

  // Tipo para materia con docente opcional 

  interface MateriaCardProps { 

    materia: { 

      id: string; 

      codigo: string; 

      nombre: string; 

      creditos: number; 

      semestre: string; 

      docente?: { nombre_completo: string; } | null;

    }; 

    mostrarDocente?: boolean; 

    accion?: React.ReactNode; 

  } 

   

  export default function MateriaCard({ 

    materia, 

    mostrarDocente = false, 

    accion, 

  }: MateriaCardProps) { 

    return ( 

      <Card className="flex flex-col justify-between hover:shadow-md transition-shadow"> 

        <CardHeader> 

          <div className="flex items-center justify-between"> 

            <Badge variant="outline" className="font-mono"> 

              {materia.codigo} 

            </Badge> 

            <Badge variant="secondary">{materia.creditos} créd.</Badge> 

          </div> 

          <CardTitle className="text-lg mt-2"> 

            {materia.nombre} 

          </CardTitle> 

          <CardDescription> 

            <span className="flex items-center gap-1"> 

              <GraduationCap className="h-3 w-3" /> 

              Semestre: {materia.semestre} 

            </span> 

          </CardDescription> 

        </CardHeader> 

   

        <CardContent> 

          {mostrarDocente && ( 

            <div className="flex items-center gap-2 text-sm text-muted-foreground"> 

              <User className="h-4 w-4" /> 

              {materia.docente 

                ? `${materia.docente.nombre_completo}` 

                : "Docente no asignado"} 

            </div> 

          )} 

        </CardContent> 

   

        {accion && ( 

          <CardFooter className="pt-0"> 

            {accion} 

          </CardFooter> 

        )} 

      </Card> 

    ); 

  } 