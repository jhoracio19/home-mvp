'use server';

import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CASA_ACTIVA_COOKIE, getSesion } from '@/lib/casas/data';

async function activarCasaCookie(casaId: string) {
  const cookieStore = await cookies();
  cookieStore.set(CASA_ACTIVA_COOKIE, casaId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
}

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
