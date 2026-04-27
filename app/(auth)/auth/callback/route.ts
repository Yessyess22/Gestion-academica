import { NextResponse } from "next/server" 
import { createClient } from "@/lib/supabase/server"  

export async function GET(request: Request) { 
  const { searchParams, origin } = new URL(request.url) 

  // Extraer el code del query string 
  const code = searchParams.get("code") 

  // Parámetro "next" opcional para redirección personalizada 
  const next = searchParams.get("next") ?? "/" 

  if (code) { 
    const supabase = await createClient() 
  
    // Intercambiar el code por una sesión 
    const { error } = await supabase.auth.exchangeCodeForSession(code) 

    if (!error) { 
      // Redirigir al usuario a la página deseada 
      return NextResponse.redirect(`${origin}${next}`) 
    } 
  } 

  // Si algo falla, redirigir a una página de error 
  return NextResponse.redirect(`${origin}/login?error=callback_failed`) 
} 