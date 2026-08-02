'use server';

import { redirect } from 'next/navigation';
import { getCasaActivaOrRedirect, getMiembrosCasaActiva, getSesion } from '@/lib/casas/data';

const MAX_DESCRIPCION = 100;

export async function agregarGasto(formData: FormData) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase, user } = await getSesion();

  const descripcion = String(formData.get('descripcion') ?? '').trim();
  const montoRaw = String(formData.get('monto') ?? '').trim();
  const pagadoPor = String(formData.get('pagado_por') ?? '').trim() || user.id;
  const fecha = String(formData.get('fecha') ?? '').trim();

  if (!descripcion) {
    redirect(`/gastos?error=${encodeURIComponent('Describe en qué se gastó.')}`);
  }
  if (descripcion.length > MAX_DESCRIPCION) {
    redirect(`/gastos?error=${encodeURIComponent(`La descripción no puede pasar de ${MAX_DESCRIPCION} caracteres.`)}`);
  }

  const monto = Number(montoRaw);
  if (!monto || monto <= 0) {
    redirect(`/gastos?error=${encodeURIComponent('Indica cuánto costó.')}`);
  }
  if (monto > 999999.99) {
    redirect(`/gastos?error=${encodeURIComponent('Ese monto es demasiado grande.')}`);
  }

  // El <select> de "quién pagó" solo lista miembros de la casa, pero
  // eso no evita un formulario tamperado — mismo motivo que la
  // validación de asignado_a en tareas (ver auth/actions.ts).
  const miembros = await getMiembrosCasaActiva();
  if (!miembros.some((m) => m.usuario_id === pagadoPor)) {
    redirect(`/gastos?error=${encodeURIComponent('Quien pagó debe ser alguien de esta casa.')}`);
  }

  const { error } = await supabase.from('gastos').insert({
    casa_id: casa.id,
    descripcion,
    monto,
    pagado_por: pagadoPor,
    fecha: fecha || undefined,
    creado_por: user.id,
  });

  if (error) {
    redirect(`/gastos?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/gastos');
}

export async function eliminarGasto(gastoId: string) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  await supabase.from('gastos').delete().eq('id', gastoId).eq('casa_id', casa.id);

  redirect('/gastos');
}
