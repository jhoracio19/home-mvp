'use server';

import { redirect } from 'next/navigation';
import { getCasaActivaOrRedirect, getSesion } from '@/lib/casas/data';

const MAX_NOMBRE = 100;

export async function agregarItemCompra(formData: FormData) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase, user } = await getSesion();

  const nombre = String(formData.get('nombre') ?? '').trim();
  if (!nombre) {
    redirect(`/compras?error=${encodeURIComponent('Escribe qué necesitan comprar.')}`);
  }
  if (nombre.length > MAX_NOMBRE) {
    redirect(`/compras?error=${encodeURIComponent(`El nombre no puede pasar de ${MAX_NOMBRE} caracteres.`)}`);
  }

  const { error } = await supabase.from('lista_compras').insert({
    casa_id: casa.id,
    nombre,
    agregado_por: user.id,
  });

  if (error) {
    redirect(`/compras?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/compras');
}

// Se usa con .bind(null, item.id, true|false) desde un <form> por cada
// item — así un solo action sirve tanto para tachar como destachar.
export async function alternarComprado(itemId: string, comprado: boolean) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase, user } = await getSesion();

  await supabase
    .from('lista_compras')
    .update({
      comprado,
      comprado_por: comprado ? user.id : null,
      comprado_en: comprado ? new Date().toISOString() : null,
    })
    .eq('id', itemId)
    .eq('casa_id', casa.id);

  redirect('/compras');
}

export async function eliminarItemCompra(itemId: string) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  await supabase.from('lista_compras').delete().eq('id', itemId).eq('casa_id', casa.id);

  redirect('/compras');
}

export async function limpiarComprados() {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  await supabase.from('lista_compras').delete().eq('casa_id', casa.id).eq('comprado', true);

  redirect('/compras');
}

// Se usa con .bind(null, item.nombre) desde el dashboard del refri:
// agrega directo a la lista sin tener que volver a escribir el nombre.
export async function agregarALista(nombre: string) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase, user } = await getSesion();

  await supabase.from('lista_compras').insert({
    casa_id: casa.id,
    nombre: nombre.slice(0, MAX_NOMBRE),
    agregado_por: user.id,
  });

  redirect(`/dashboard?agregado=${encodeURIComponent(nombre)}`);
}
