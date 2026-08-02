'use server';

import { redirect } from 'next/navigation';
import { getCasaActivaOrRedirect, getSesion } from '@/lib/casas/data';

const MAX_CONTENIDO = 5000;

export async function actualizarNotaCasa(formData: FormData) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase, user } = await getSesion();

  const contenido = String(formData.get('contenido') ?? '').trim();
  if (contenido.length > MAX_CONTENIDO) {
    redirect(`/notas?error=${encodeURIComponent(`No puede pasar de ${MAX_CONTENIDO} caracteres.`)}`);
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
    redirect(`/notas?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/notas?message=${encodeURIComponent('Notas guardadas.')}`);
}
