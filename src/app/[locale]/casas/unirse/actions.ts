'use server';

import { getLocale, getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { activarCasaCookie } from '@/lib/casas/data';

export async function unirseConCodigo(codigo: string) {
  const t = await getTranslations('UnirseCasa');
  const locale = (await getLocale()) as Locale;
  const codigoNormalizado = codigo.trim().toUpperCase();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({
      href: `/login?next=${encodeURIComponent(`/casas/unirse?codigo=${codigoNormalizado}`)}`,
      locale,
    });
  }

  const { data: casaId, error } = await supabase.rpc('unirse_a_casa', {
    p_codigo: codigoNormalizado,
  });

  if (error || !casaId) {
    redirect({
      href: `/casas/unirse?codigo=${encodeURIComponent(codigoNormalizado)}&error=${encodeURIComponent(
        error?.message ?? t('errorNoSePudoUnir')
      )}`,
      locale,
    });
  }

  await activarCasaCookie(casaId);
  redirect({ href: '/dashboard', locale });
}
