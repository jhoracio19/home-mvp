import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// En Next.js 16 el archivo `middleware.ts` fue renombrado a `proxy.ts`
// (la función exportada también se llama `proxy`, no `middleware`).
// Su único trabajo aquí es refrescar el token de Supabase en cada
// request para que las cookies de sesión no expiren silenciosamente.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresca la sesión si el access token expiró. Necesario para
  // que Server Components puedan leer una sesión válida.
  //
  // Envuelto en try/catch a propósito: justo tras emitir un token
  // nuevo (login, cambio de contraseña) puede haber un desfase de
  // reloj de milisegundos entre Supabase y Vercel que hace tronar
  // getUser() con "JWT issued at future" — transitorio y se
  // autocorrige solo. Si truena aquí, mejor dejar pasar la petición
  // sin refrescar que tumbar la página completa; getSesion() (con su
  // propio reintento) es quien de verdad decide si hay sesión válida.
  try {
    await supabase.auth.getUser();
  } catch {
    // Silencioso a propósito — ver comentario arriba.
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
