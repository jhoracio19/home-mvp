'use server';

import { redirect } from 'next/navigation';
import { getCasaActivaOrRedirect, getMiembrosCasaActiva, getSesion } from '@/lib/casas/data';
import { nombreMiembro } from '@/lib/casas/nombre-miembro';
import { enviarNotificacionAUsuario } from '@/lib/notificaciones/enviar';

const MAX_DESCRIPCION = 100;
const MONTO_MAXIMO = 999999.99;
const formatoMoneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

// Si falla el push no debe tumbar el registro del gasto/pago — mismo
// criterio que notificarAsignacion en tareas/actions.ts.
async function notificarNuevoGasto(creadoPor: string, descripcion: string, monto: number) {
  try {
    const miembros = await getMiembrosCasaActiva();
    await Promise.all(
      miembros
        .filter((m) => m.usuario_id !== creadoPor)
        .map((m) =>
          enviarNotificacionAUsuario(m.usuario_id, {
            title: 'Nuevo gasto',
            body: `${descripcion}: ${formatoMoneda.format(monto)}`,
            url: '/gastos',
          })
        )
    );
  } catch {
    // Silencioso a propósito.
  }
}

async function notificarPagoRecibido(aUsuarioId: string, deUsuarioId: string, monto: number) {
  if (aUsuarioId === deUsuarioId) return;
  try {
    const miembros = await getMiembrosCasaActiva();
    const de = miembros.find((m) => m.usuario_id === deUsuarioId);
    await enviarNotificacionAUsuario(aUsuarioId, {
      title: 'Pago recibido',
      body: `${de ? nombreMiembro(de) : 'Alguien'} te pagó ${formatoMoneda.format(monto)}`,
      url: '/gastos',
    });
  } catch {
    // Silencioso a propósito.
  }
}

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
  if (monto > MONTO_MAXIMO) {
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

  await notificarNuevoGasto(user.id, descripcion, monto);

  redirect('/gastos');
}

export async function eliminarGasto(gastoId: string) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  await supabase.from('gastos').delete().eq('id', gastoId).eq('casa_id', casa.id);

  redirect('/gastos');
}

export async function registrarPago(formData: FormData) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase, user } = await getSesion();

  const deUsuarioId = String(formData.get('de_usuario_id') ?? '').trim() || user.id;
  const aUsuarioId = String(formData.get('a_usuario_id') ?? '').trim();
  const montoRaw = String(formData.get('monto') ?? '').trim();
  const fecha = String(formData.get('fecha') ?? '').trim();

  const monto = Number(montoRaw);
  if (!monto || monto <= 0) {
    redirect(`/gastos?error=${encodeURIComponent('Indica cuánto se pagó.')}`);
  }
  if (monto > MONTO_MAXIMO) {
    redirect(`/gastos?error=${encodeURIComponent('Ese monto es demasiado grande.')}`);
  }
  if (deUsuarioId === aUsuarioId) {
    redirect(`/gastos?error=${encodeURIComponent('Elige a alguien distinto para el pago.')}`);
  }

  const miembros = await getMiembrosCasaActiva();
  if (!miembros.some((m) => m.usuario_id === deUsuarioId) || !miembros.some((m) => m.usuario_id === aUsuarioId)) {
    redirect(`/gastos?error=${encodeURIComponent('El pago debe ser entre miembros de esta casa.')}`);
  }

  const { error } = await supabase.from('pagos').insert({
    casa_id: casa.id,
    de_usuario_id: deUsuarioId,
    a_usuario_id: aUsuarioId,
    monto,
    fecha: fecha || undefined,
    creado_por: user.id,
  });

  if (error) {
    redirect(`/gastos?error=${encodeURIComponent(error.message)}`);
  }

  await notificarPagoRecibido(aUsuarioId, deUsuarioId, monto);

  redirect('/gastos');
}

export async function eliminarPago(pagoId: string) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  await supabase.from('pagos').delete().eq('id', pagoId).eq('casa_id', casa.id);

  redirect('/gastos');
}
