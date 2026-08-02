'use server';

import { redirect } from 'next/navigation';
import { getCasaActivaOrRedirect, getSesion } from '@/lib/casas/data';

const MAX_NOMBRE = 100;
const MAX_CANTIDAD = 30;

export async function agregarItemCompra(formData: FormData) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase, user } = await getSesion();

  const nombre = String(formData.get('nombre') ?? '').trim();
  const cantidad = String(formData.get('cantidad') ?? '').trim() || null;

  if (!nombre) {
    redirect(`/compras?error=${encodeURIComponent('Escribe qué necesitan comprar.')}`);
  }
  if (nombre.length > MAX_NOMBRE) {
    redirect(`/compras?error=${encodeURIComponent(`El nombre no puede pasar de ${MAX_NOMBRE} caracteres.`)}`);
  }
  if (cantidad && cantidad.length > MAX_CANTIDAD) {
    redirect(`/compras?error=${encodeURIComponent(`La cantidad no puede pasar de ${MAX_CANTIDAD} caracteres.`)}`);
  }

  // Evita duplicar si ya está pendiente (ej. dos personas agregando
  // "leche" casi al mismo tiempo, o el mismo botón "+ Lista" dos veces).
  const { data: existente } = await supabase
    .from('lista_compras')
    .select('id')
    .eq('casa_id', casa.id)
    .eq('comprado', false)
    .ilike('nombre', nombre)
    .maybeSingle();

  if (existente) {
    redirect(`/compras?message=${encodeURIComponent(`"${nombre}" ya estaba en la lista.`)}`);
  }

  const { error } = await supabase.from('lista_compras').insert({
    casa_id: casa.id,
    nombre,
    cantidad,
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
  const nombreLimitado = nombre.slice(0, MAX_NOMBRE);

  const { data: existente } = await supabase
    .from('lista_compras')
    .select('id')
    .eq('casa_id', casa.id)
    .eq('comprado', false)
    .ilike('nombre', nombreLimitado)
    .maybeSingle();

  if (existente) {
    redirect(`/dashboard?agregado=${encodeURIComponent(nombreLimitado)}&yaExistia=1`);
  }

  await supabase.from('lista_compras').insert({
    casa_id: casa.id,
    nombre: nombreLimitado,
    agregado_por: user.id,
  });

  redirect(`/dashboard?agregado=${encodeURIComponent(nombreLimitado)}`);
}
