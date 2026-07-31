'use server';

import { randomUUID } from 'crypto';
import { redirect } from 'next/navigation';
import { activarCasaCookie, getCasaActivaOrRedirect, getSesion } from '@/lib/casas/data';

export async function crearCasa(formData: FormData) {
  const nombre = String(formData.get('nombre') ?? '').trim();
  if (!nombre) {
    redirect(`/casas?error=${encodeURIComponent('Ponle un nombre a la casa.')}`);
  }

  const { supabase, user } = await getSesion();
  const casaId = randomUUID();

  // El trigger trg_nueva_casa (schema.sql) agrega automáticamente
  // al creador como admin en miembros_casa.
  //
  // No usamos .select().single() aquí: pedir RETURNING obliga a que la
  // fila recién creada también pase la policy SELECT de RLS en la misma
  // mutación, antes de que el usuario pueda verla como miembro. Generar el
  // id en la app evita esa lectura inmediata.
  const { error } = await supabase
    .from('casas')
    .insert({ id: casaId, nombre, creada_por: user.id });

  if (error) {
    redirect(`/casas?error=${encodeURIComponent(error?.message ?? 'No se pudo crear la casa.')}`);
  }

  await activarCasaCookie(casaId);
  redirect('/dashboard');
}

// Se usa con .bind(null, casa.id) desde un <form> por cada casa en
// la lista, así no necesitamos un Client Component para el selector.
export async function seleccionarCasa(casaId: string) {
  await activarCasaCookie(casaId);
  redirect('/dashboard');
}

const ALFABETO_CODIGO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sin 0/O, 1/I/L: se puede dictar sin ambigüedad

function generarCodigo(longitud = 8) {
  let codigo = '';
  for (let i = 0; i < longitud; i++) {
    codigo += ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)];
  }
  return codigo;
}

// Solo un admin puede regenerar el código (lo hace cumplir la policy
// "casas_update_admin" en la base; esto es una capa extra de UX, no
// la línea de defensa real).
export async function generarCodigoInvitacion() {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  const codigo = generarCodigo();
  const expira = new Date();
  expira.setDate(expira.getDate() + 7);

  const { error } = await supabase
    .from('casas')
    .update({ codigo_invitacion: codigo, codigo_invitacion_expira: expira.toISOString() })
    .eq('id', casa.id);

  if (error) {
    redirect(`/casas/invitar?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/casas/invitar');
}
