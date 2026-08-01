'use server';

import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CASA_ACTIVA_COOKIE, activarCasaCookie, getCasaActivaOrRedirect, getSesion } from '@/lib/casas/data';

export async function crearCasa(formData: FormData) {
  const nombre = String(formData.get('nombre') ?? '').trim();
  if (!nombre) {
    redirect(`/casas?error=${encodeURIComponent('Ponle un nombre a la casa.')}`);
  }
  if (nombre.length > 80) {
    redirect(`/casas?error=${encodeURIComponent('El nombre no puede pasar de 80 caracteres.')}`);
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

// Te quita a TI de la casa activa (no a otro miembro — eso es
// quitarMiembro). Bloqueado si eres el único miembro para no dejar la
// casa sin nadie que pueda entrar a ella nunca más.
export async function salirDeCasa() {
  const casa = await getCasaActivaOrRedirect();
  const { supabase, user } = await getSesion();

  const { count } = await supabase
    .from('miembros_casa')
    .select('*', { count: 'exact', head: true })
    .eq('casa_id', casa.id);

  if ((count ?? 0) <= 1) {
    redirect(
      `/casas?error=${encodeURIComponent('Eres el único miembro de esta casa, no puedes salir.')}`
    );
  }

  await supabase.from('miembros_casa').delete().eq('casa_id', casa.id).eq('usuario_id', user.id);

  const cookieStore = await cookies();
  cookieStore.delete(CASA_ACTIVA_COOKIE);

  redirect(`/casas?message=${encodeURIComponent(`Saliste de "${casa.nombre}".`)}`);
}

// Solo lo puede usar un admin (lo hace cumplir la policy
// "casas_update_admin" — si no eres admin, el update no toca ninguna
// fila y simplemente no pasa nada, sin error explícito).
export async function renombrarCasa(formData: FormData) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  const nombre = String(formData.get('nombre') ?? '').trim();
  if (!nombre) {
    redirect(`/casas/configuracion?error=${encodeURIComponent('Ponle un nombre a la casa.')}`);
  }
  if (nombre.length > 80) {
    redirect(`/casas/configuracion?error=${encodeURIComponent('El nombre no puede pasar de 80 caracteres.')}`);
  }

  const { error } = await supabase.from('casas').update({ nombre }).eq('id', casa.id);

  if (error) {
    redirect(`/casas/configuracion?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/casas/configuracion?message=Nombre actualizado.');
}

// Solo lo puede usar un admin (policy "casas_delete_admin"). El resto
// de las filas de esta casa (miembros, refri, tareas) se van con ella
// por los "on delete cascade" del schema — no hay que borrarlas aparte.
export async function eliminarCasa() {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  const { error } = await supabase.from('casas').delete().eq('id', casa.id);

  if (error) {
    redirect(`/casas/configuracion?error=${encodeURIComponent(error.message)}`);
  }

  const cookieStore = await cookies();
  cookieStore.delete(CASA_ACTIVA_COOKIE);

  redirect(`/casas?message=${encodeURIComponent(`Se eliminó "${casa.nombre}".`)}`);
}

// Solo lo pueden usar admins (lo hace cumplir la policy
// "miembros_delete_admin_o_propio"): quita a OTRO miembro de la casa.
export async function quitarMiembro(usuarioId: string) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  const { error } = await supabase
    .from('miembros_casa')
    .delete()
    .eq('casa_id', casa.id)
    .eq('usuario_id', usuarioId);

  if (error) {
    redirect(`/casas/invitar?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/casas/invitar');
}
