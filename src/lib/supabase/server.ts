import { cache } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/types/database';

// Cliente para Server Components, Server Actions y Route Handlers.
// `cookies()` es async desde Next.js 15+; en Server Components el
// intento de escritura se ignora silenciosamente (Next lanza si se
// intenta) — por eso el try/catch: la sesión igual se refresca en proxy.ts.
//
// IMPORTANTE: @supabase/ssr usa inicialización de sesión perezosa — un
// cliente nuevo no carga el JWT de las cookies hasta que se llama
// getUser()/getSession()/getClaims() en ESA instancia. Si cada función
// crea su propio cliente y hace una query sin llamar antes a uno de
// esos métodos, la query sale sin auth y RLS la trata como anónima
// (esto causó "new row violates row-level security policy" en
// crearCasa: insertaba con un cliente que nunca había cargado sesión).
// cache() memoiza la instancia dentro del mismo render/Server Action,
// así basta con que UNA llamada (getUsuarioActual) inicialice sesión.
export const createClient = cache(async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignorado: ocurre cuando setAll se llama desde un Server
            // Component. Es inofensivo si proxy.ts refresca la sesión.
          }
        },
      },
    }
  );
});
