import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

// En Next.js 16 el archivo `middleware.ts` fue renombrado a `proxy.ts`
// (la función exportada también se llama `proxy`, no `middleware`).
// Hace dos cosas en cada request: (1) decide/reescribe el locale
// (/es o /en) vía next-intl, y (2) refresca el token de Supabase para
// que las cookies de sesión no expiren silenciosamente. Las cookies
// de Supabase se escriben sobre la MISMA response que devuelve
// next-intl (no una nueva) para no perder su rewrite/redirect.
export async function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);

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
    // Excluye: rutas de API, el callback de OAuth (URL fija, no se
    // localiza), archivos estáticos de Next, y los archivos especiales
    // de la PWA (manifest, iconos, imágenes para compartir en redes).
    '/((?!api|auth/callback|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon.svg|opengraph-image|twitter-image|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
