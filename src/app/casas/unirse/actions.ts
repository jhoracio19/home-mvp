'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { activarCasaCookie } from '@/lib/casas/data';

export async function unirseConCodigo(codigo: string) {
  const codigoNormalizado = codigo.trim().toUpperCase();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/casas/unirse?codigo=${codigoNormalizado}`)}`);
  }

  const { data: casaId, error } = await supabase.rpc('unirse_a_casa', {
    p_codigo: codigoNormalizado,
  });

  if (error || !casaId) {
    redirect(
      `/casas/unirse?codigo=${encodeURIComponent(codigoNormalizado)}&error=${encodeURIComponent(
        error?.message ?? 'No se pudo unir a la casa.'
      )}`
    );
  }

  await activarCasaCookie(casaId);
  redirect('/dashboard');
}
