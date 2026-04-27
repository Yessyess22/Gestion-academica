import { redirect } from "next/navigation" 

import { createClient } from "@/lib/supabase/server" 

  

export default async function Home() { 

  const supabase = await createClient() 

  

  const { 

    data: { user }, 

  } = await supabase.auth.getUser() 

  

  if (!user) { 

    redirect("/login") 

  } 

  

  // Si hay usuario, obtener su rol y redirigir 

  const { data: perfil } = await supabase 

    .from("usuarios_perfil") 

    .select("rol") 

    .eq("id", user.id) 

    .single() 

  

  if (perfil) { 

    redirect(`/${perfil.rol}`) 

  } 

  

  redirect("/login") 

} 