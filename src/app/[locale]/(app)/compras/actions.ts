'use server';

import { getLocale, getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getCasaActivaOrRedirect, getSesion } from '@/lib/casas/data';

const MAX_NOMBRE = 100;
const MAX_CANTIDAD = 30;

export async function agregarItemCompra(formData: FormData) {
  const t = await getTranslations('Compras');
  const locale = (await getLocale()) as Locale;
  const casa = await getCasaActivaOrRedirect();
  const { supabase, user } = await getSesion();

  const nombre = String(formData.get('nombre') ?? '').trim();
  const cantidad = String(formData.get('cantidad') ?? '').trim() || null;

  if (!nombre) {
    redirect({ href: `/compras?error=${encodeURIComponent(t('errorNombreObligatorio'))}`, locale });
  }
  if (nombre.length > MAX_NOMBRE) {
    redirect({ href: `/compras?error=${encodeURIComponent(t('errorNombreLargo', { max: MAX_NOMBRE }))}`, locale });
  }
  if (cantidad && cantidad.length > MAX_CANTIDAD) {
    redirect({ href: `/compras?error=${encodeURIComponent(t('errorCantidadLarga', { max: MAX_CANTIDAD }))}`, locale });
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
    redirect({ href: `/compras?message=${encodeURIComponent(t('yaEstabaEnLista', { nombre }))}`, locale });
  }

  const { error } = await supabase.from('lista_compras').insert({
    casa_id: casa.id,
    nombre,
    cantidad,
    agregado_por: user.id,
  });

  if (error) {
    redirect({ href: `/compras?error=${encodeURIComponent(error.message)}`, locale });
  }

  redirect({ href: '/compras', locale });
}

// Se usa con .bind(null, item.id, true|false) desde un <form> por cada
// item — así un solo action sirve tanto para tachar como destachar.
export async function alternarComprado(itemId: string, comprado: boolean) {
  const locale = (await getLocale()) as Locale;
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

  redirect({ href: '/compras', locale });
}

export async function eliminarItemCompra(itemId: string) {
  const locale = (await getLocale()) as Locale;
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  await supabase.from('lista_compras').delete().eq('id', itemId).eq('casa_id', casa.id);

  redirect({ href: '/compras', locale });
}

export async function limpiarComprados() {
  const locale = (await getLocale()) as Locale;
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  await supabase.from('lista_compras').delete().eq('casa_id', casa.id).eq('comprado', true);

  redirect({ href: '/compras', locale });
}

// Se usa con .bind(null, item.nombre) desde el dashboard del refri:
// agrega directo a la lista sin tener que volver a escribir el nombre.
export async function agregarALista(nombre: string) {
  const locale = (await getLocale()) as Locale;
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
    redirect({ href: `/dashboard?agregado=${encodeURIComponent(nombreLimitado)}&yaExistia=1`, locale });
  }

  await supabase.from('lista_compras').insert({
    casa_id: casa.id,
    nombre: nombreLimitado,
    agregado_por: user.id,
  });

  redirect({ href: `/dashboard?agregado=${encodeURIComponent(nombreLimitado)}`, locale });
}
