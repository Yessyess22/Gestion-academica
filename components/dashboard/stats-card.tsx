import { LucideIcon } from "lucide-react" 
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
} from "@/components/ui/card" 

interface StatsCardProps { 
  title: string 
  value: string | number 
  description?: string 
  icon: any
} 

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
}: StatsCardProps) { 
  return ( 
    <Card className="shadow-sm hover:shadow-md transition-shadow border-none bg-card/60 backdrop-blur-sm"> 
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> 
        <CardTitle className="text-sm font-semibold tracking-tight"> 
          {title} 
        </CardTitle> 
        <div className="p-2 bg-primary/5 rounded-md">
          <Icon className="h-4 w-4 text-primary" /> 
        </div>
      </CardHeader> 
      <CardContent> 
        <div className="text-2xl font-bold tracking-tighter">{value}</div> 
        {description && ( 
          <p className="text-xs text-muted-foreground mt-1 font-medium"> 
            {description} 
          </p> 
        )} 
      </CardContent> 
    </Card> 
  ) 
}
