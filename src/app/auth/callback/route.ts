import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Recibe el `code` que Supabase agrega al redirigir de vuelta desde
// Google OAuth o desde el link de confirmación de correo, y lo
// intercambia por una sesión (cookies httpOnly).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
