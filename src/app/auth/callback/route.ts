import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { destinoSeguro } from '@/lib/auth/destino-seguro';
import { routing } from '@/i18n/routing';

// Recibe el `code` que Supabase agrega al redirigir de vuelta desde
// Google OAuth o desde el link de confirmación de correo, y lo
// intercambia por una sesión (cookies httpOnly).
//
// Esta ruta vive FUERA de /[locale] a propósito — es una URL técnica
// fija que Supabase/Google ya tienen configurada, no algo que el
// usuario ve — así que next-intl no le agrega prefijo de idioma. Por
// eso el destino final sí necesita que le agreguemos el locale a mano.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // destinoSeguro() evita un "open redirect": sin validar, alguien
  // podría mandar ?next=https://sitio-malicioso.com y usar un login
  // real de esta app para saltar a otro dominio (típico truco de
  // phishing que se aprovecha de la confianza en el dominio real).
  const next = destinoSeguro(searchParams.get('next'));
  const locale = readLocaleCookie(request) ?? routing.defaultLocale;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/${locale}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/auth/auth-code-error`);
}

function readLocaleCookie(request: Request): string | undefined {
  const raw = request.headers.get('cookie') ?? '';
  const match = raw.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  const value = match?.[1] ? decodeURIComponent(match[1]) : undefined;
  return routing.locales.includes(value as (typeof routing.locales)[number]) ? value : undefined;
}
