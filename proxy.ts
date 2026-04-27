import { createServerClient } from "@supabase/ssr" 
import { NextResponse, type NextRequest } from "next/server"   

export async function proxy(request: NextRequest) { 
  const pathname = request.nextUrl.pathname

  // 1. Crear una respuesta inicial que pasa el request original 
  let supabaseResponse = NextResponse.next({ 
    request, 
  })   

  // 2. Crear cliente Supabase con manejo de cookies 
  const supabase = createServerClient( 
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, 
    { 
      cookies: { 
        getAll() { 
          return request.cookies.getAll() 
        }, 
        setAll(cookiesToSet, headers) { 
          // Actualizar cookies en el request (para Server Components) 
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value) 
          ) 
          // Crear nueva respuesta con request actualizado 
          supabaseResponse = NextResponse.next({ 
            request, 
          }) 
          // Actualizar cookies en la respuesta (para el navegador) 
          cookiesToSet.forEach(({ name, value, options }) => 
            supabaseResponse.cookies.set(name, value, options) 
          ) 
          // Sincronizar headers 
          Object.entries(headers).forEach(([key, value]) => 
            supabaseResponse.headers.set(key, value) 
          ) 
        }, 
      }, 
    } 
  ) 

  // 3. IMPORTANTE: Verificar el usuario actual 

  // No ejecutes código entre createServerClient y auth.getUser() 
  const { 
    data: { user }, 
  } = await supabase.auth.getUser() 

  // 4. Definir rutas públicas y privadas 
  const publicRoutes = ["/", "/login", "/registro", "/auth"] 
  const privateRoutePrefixes = ["/admin", "/docente", "/estudiante"]

  const isPublicRoute = publicRoutes.some((route) => 
    route === "/" ? pathname === "/" : pathname.startsWith(route) 
  ) 

  const isPrivateRoute = privateRoutePrefixes.some((route) =>
    pathname.startsWith(route)
  )

  // 5. Si no hay usuario y la ruta es privada, redirigir a login
  if (!user && isPrivateRoute && !isPublicRoute) { 
    const url = request.nextUrl.clone() 
    url.pathname = "/login" 
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url) 
  } 

  // 6. No redirigir a usuarios autenticados en rutas públicas
  // Permitir que accedan a login/registro incluso si tienen sesión
  // (para cerrar sesión o cambiar de cuenta) 

  return supabaseResponse 
}
