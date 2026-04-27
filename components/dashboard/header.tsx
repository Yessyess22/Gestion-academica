"use client" 

import { useRouter } from "next/navigation" 
import { LogOut, UserCircle } from "lucide-react" 
import { createClient } from "@/lib/supabase/client" 

import { Avatar, AvatarFallback } from "@/components/ui/avatar" 
import { Button } from "@/components/ui/button" 
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger, 
} from "@/components/ui/dropdown-menu" 

interface HeaderProps { 
  nombreUsuario: string 
  email: string 
  rol: string 
} 

export function DashboardHeader({ 
  nombreUsuario, 
  email, 
  rol, 
}: HeaderProps) { 
  const router = useRouter() 

  // Obtener las iniciales del nombre para el avatar 
  function getInitials(name: string): string { 
    return name 
      .split(" ") 
      .map((word) => word.charAt(0)) 
      .slice(0, 2) 
      .join("") 
      .toUpperCase() 
  } 

  async function handleLogout() { 
    const supabase = createClient() 
    await supabase.auth.signOut() 
    router.push("/login") 
    router.refresh() 
  } 

  return ( 
    <div className="ml-auto flex items-center gap-4"> 
      {/* ─── Dropdown del usuario ─── */} 
      <DropdownMenu> 
        <DropdownMenuTrigger asChild> 
          <Button variant="ghost" className="relative h-9 w-9 rounded-full"> 
            <Avatar className="h-9 w-9"> 
              <AvatarFallback className="bg-primary text-primary-foreground text-sm"> 
                {getInitials(nombreUsuario)} 
              </AvatarFallback> 
            </Avatar> 
          </Button> 
        </DropdownMenuTrigger> 

        <DropdownMenuContent className="w-56" align="end" forceMount> 
          {/* ─── Información del usuario ─── */} 
          <DropdownMenuLabel className="font-normal"> 
            <div className="flex flex-col space-y-1"> 
              <p className="text-sm font-medium leading-none"> 
                {nombreUsuario} 
              </p> 
              <p className="text-xs leading-none text-muted-foreground"> 
                {email} 
              </p> 
              <p className="text-xs leading-none text-muted-foreground capitalize"> 
                {rol} 
              </p> 
            </div> 
          </DropdownMenuLabel> 

          <DropdownMenuSeparator /> 

          {/* ─── Opciones del menú ─── */} 
          <DropdownMenuItem 
            onClick={() => router.push(`/${rol}/perfil`)} 
            className="cursor-pointer" 
          > 
            <UserCircle className="mr-2 h-4 w-4" /> 
            Mi Perfil 
          </DropdownMenuItem> 

          <DropdownMenuSeparator /> 

          <DropdownMenuItem 
            onClick={handleLogout} 
            className="cursor-pointer text-destructive focus:text-destructive" 
          > 
            <LogOut className="mr-2 h-4 w-4" /> 
            Cerrar Sesión 
          </DropdownMenuItem> 
        </DropdownMenuContent> 
      </DropdownMenu> 
    </div> 
  ) 
} 