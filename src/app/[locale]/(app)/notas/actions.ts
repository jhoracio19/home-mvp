'use server';

import { getLocale, getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getCasaActivaOrRedirect, getSesion } from '@/lib/casas/data';

const MAX_CONTENIDO = 5000;

export async function actualizarNotaCasa(formData: FormData) {
  const t = await getTranslations('Notas');
  const locale = (await getLocale()) as Locale;
  const casa = await getCasaActivaOrRedirect();
  const { supabase, user } = await getSesion();

  const contenido = String(formData.get('contenido') ?? '').trim();
  if (contenido.length > MAX_CONTENIDO) {
    redirect({ href: `/notas?error=${encodeURIComponent(t('errorMuyLargo', { max: MAX_CONTENIDO }))}`, locale });
  }

  // Upsert (no update): la fila de notas_casa no existe hasta el
  // primer guardado — no hay trigger que la cree de antemano como sí
  // pasa con miembros_casa al crear una casa.
  const { error } = await supabase.from('notas_casa').upsert(
    {
      casa_id: casa.id,
      contenido,
      actualizado_por: user.id,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: 'casa_id' }
  );

  if (error) {
    redirect({ href: `/notas?error=${encodeURIComponent(error.message)}`, locale });
  }

  redirect({ href: `/notas?message=${encodeURIComponent(t('guardadas'))}`, locale });
}
