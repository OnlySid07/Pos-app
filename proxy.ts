import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log('[proxy.ts] intercepting:', pathname)

  // Rutas públicas que no necesitan autenticación
  const publicRoutes = ['/login', '/']

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Para rutas protegidas, verificar autenticación
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('[proxy.ts] auth Check:', { user: user?.id, pathname })

  if (!user && (
      pathname.startsWith('/dashboard') || 
      pathname.startsWith('/clientes') || 
      pathname.startsWith('/propiedades') || 
      pathname.startsWith('/ventas') ||
      pathname.startsWith('/caja-pagos') || 
      pathname.startsWith('/reportes') ||
      pathname.startsWith('/configuracion')
  )) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon|apple-icon).*)'],
}
