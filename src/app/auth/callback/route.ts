import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { destinoSeguro } from '@/lib/auth/destino-seguro';

// Recibe el `code` que Supabase agrega al redirigir de vuelta desde
// Google OAuth o desde el link de confirmación de correo, y lo
// intercambia por una sesión (cookies httpOnly).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // destinoSeguro() evita un "open redirect": sin validar, alguien
  // podría mandar ?next=https://sitio-malicioso.com y usar un login
  // real de esta app para saltar a otro dominio (típico truco de
  // phishing que se aprovecha de la confianza en el dominio real).
  const next = destinoSeguro(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
