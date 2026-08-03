'use server';

import { getLocale, getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getSesion } from '@/lib/casas/data';
import { createClient } from '@/lib/supabase/server';

// La usa LocaleSwitcher.tsx, que vive tanto dentro de la app como en
// la landing/páginas de auth (sin sesión) — por eso NO usa getSesion()
// (que redirige a /login si no hay usuario): aquí no hay sesión es un
// caso normal, simplemente no hay nada que guardar todavía y la cookie
// NEXT_LOCALE de next-intl basta.
export async function actualizarIdioma(idioma: Locale) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from('perfiles').upsert({ id: user.id, idioma }, { onConflict: 'id' });
}

export async function actualizarPerfil(formData: FormData) {
  const tPerfil = await getTranslations('Perfil');
  const locale = (await getLocale()) as Locale;
  const nombre = String(formData.get('nombre') ?? '').trim();

  if (!nombre) {
    redirect({ href: `/perfil?error=${encodeURIComponent(tPerfil('nicknameObligatorio'))}`, locale });
  }
  if (nombre.length > 60) {
    redirect({ href: `/perfil?error=${encodeURIComponent(tPerfil('nicknameLargo'))}`, locale });
  }

  const { supabase, user } = await getSesion();

  // upsert (no update): así también funciona para cuentas viejas que se
  // crearon antes de que existiera el trigger que llena `perfiles` solo.
  // No se toca `apellido` — así quien ya lo tenía guardado (de antes de
  // este cambio) no lo pierde, aunque ya no se pida ni se pueda editar.
  const { error } = await supabase
    .from('perfiles')
    .upsert({ id: user.id, nombre }, { onConflict: 'id' });

  if (error) {
    redirect({ href: `/perfil?error=${encodeURIComponent(error.message)}`, locale });
  }

  redirect({ href: `/perfil?message=${encodeURIComponent(tPerfil('perfilActualizado'))}`, locale });
}
