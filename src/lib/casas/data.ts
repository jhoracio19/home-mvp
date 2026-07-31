import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const CASA_ACTIVA_COOKIE = 'casa_activa_id';

// Par atómico cliente+usuario: @supabase/ssr inicializa la sesión de
// forma perezosa (el JWT no se carga hasta llamar getUser()/getSession()
// EN ESA instancia puntual). Si "quién soy" y "con qué cliente consulto"
// se separan en funciones cache() distintas, no hay garantía de que
// compartan instancia entre sí dentro de una Server Action — así se
// coló el bug de "new row violates row-level security policy" en
// crearCasa. Por eso este helper siempre entrega ambos juntos.
export const getSesion = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  return { supabase, user };
});

export const getUsuarioActual = cache(async () => {
  const { user } = await getSesion();
  return user;
});

export const getCasasDelUsuario = cache(async () => {
  const { supabase } = await getSesion();

  // RLS ya filtra a las casas donde el usuario es miembro
  // (ver policy "casas_select_miembros" en supabase/schema.sql).
  const { data, error } = await supabase
    .from('casas')
    .select('id, nombre, created_at, codigo_invitacion, codigo_invitacion_expira')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
});

export const getCasaActiva = cache(async () => {
  const cookieStore = await cookies();
  const casaId = cookieStore.get(CASA_ACTIVA_COOKIE)?.value;
  if (!casaId) return null;

  // Revalida contra la lista real por si el usuario perdió acceso
  // a esa casa (removido por un admin) desde la última visita.
  const casas = await getCasasDelUsuario();
  return casas.find((casa) => casa.id === casaId) ?? null;
});

export const getCasaActivaOrRedirect = cache(async () => {
  const casa = await getCasaActiva();
  if (!casa) redirect('/casas');
  return casa;
});

export async function activarCasaCookie(casaId: string) {
  const cookieStore = await cookies();
  cookieStore.set(CASA_ACTIVA_COOKIE, casaId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
}

export const getRolEnCasaActiva = cache(async () => {
  const casa = await getCasaActivaOrRedirect();
  const { supabase, user } = await getSesion();

  const { data, error } = await supabase
    .from('miembros_casa')
    .select('rol')
    .eq('casa_id', casa.id)
    .eq('usuario_id', user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.rol ?? null;
});

// Miembros de la casa activa con su email + nombre/apellido (si ya
// completaron su perfil), vía la función RPC `miembros_casa_con_perfil`
// (auth.users no es legible directo por el cliente). Se usa en el
// selector de "asignar a" de tareas y en la página de invitar.
export const getMiembrosCasaActiva = cache(async () => {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  const { data, error } = await supabase.rpc('miembros_casa_con_perfil', {
    p_casa_id: casa.id,
  });

  if (error) throw new Error(error.message);
  return data;
});

export function nombreMiembro(m: { email: string; nombre: string | null; apellido: string | null }) {
  if (m.nombre && m.apellido) return `${m.nombre} ${m.apellido}`;
  return m.email;
}
