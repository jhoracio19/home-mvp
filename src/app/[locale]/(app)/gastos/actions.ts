'use server';

import { getLocale, getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getCasaActivaOrRedirect, getMiembrosCasaActiva, getSesion } from '@/lib/casas/data';
import { enviarNotificacionAUsuario } from '@/lib/notificaciones/enviar';
import { intlLocale } from '@/lib/intl-locale';

const MAX_DESCRIPCION = 100;
const MONTO_MAXIMO = 999999.99;

function formatoMonedaPara(locale: Locale) {
  return new Intl.NumberFormat(intlLocale(locale), { style: 'currency', currency: 'MXN' });
}

// Si falla el push no debe tumbar el registro del gasto/pago — mismo
// criterio que notificarAsignacion en tareas/actions.ts.
async function notificarNuevoGasto(creadoPor: string, descripcion: string, monto: number) {
  try {
    const miembros = await getMiembrosCasaActiva();
    await Promise.all(
      miembros
        .filter((m) => m.usuario_id !== creadoPor)
        .map((m) =>
          enviarNotificacionAUsuario(m.usuario_id, async (locale) => {
            const t = await getTranslations({ locale, namespace: 'Push' });
            return {
              title: t('nuevoGastoTitulo'),
              body: t('nuevoGastoCuerpo', { descripcion, monto: formatoMonedaPara(locale).format(monto) }),
              url: '/gastos',
            };
          })
        )
    );
  } catch {
    // Silencioso a propósito.
  }
}

// Le avisa al DEUDOR que quien recibió el dinero ya confirmó el pago
// — ya no hace falta buscar su nombre: el push es para él, no habla de
// un tercero.
async function notificarPagoConfirmado(deUsuarioId: string, monto: number) {
  try {
    await enviarNotificacionAUsuario(deUsuarioId, async (locale) => {
      const t = await getTranslations({ locale, namespace: 'Push' });
      return {
        title: t('pagoConfirmadoTitulo'),
        body: t('pagoConfirmadoCuerpo', { monto: formatoMonedaPara(locale).format(monto) }),
        url: '/gastos',
      };
    });
  } catch {
    // Silencioso a propósito.
  }
}

export async function agregarGasto(formData: FormData) {
  const t = await getTranslations('Gastos');
  const locale = (await getLocale()) as Locale;
  const casa = await getCasaActivaOrRedirect();
  const { supabase, user } = await getSesion();

  const descripcion = String(formData.get('descripcion') ?? '').trim();
  const montoRaw = String(formData.get('monto') ?? '').trim();
  const pagadoPor = String(formData.get('pagado_por') ?? '').trim() || user.id;
  const fecha = String(formData.get('fecha') ?? '').trim();

  if (!descripcion) {
    redirect({ href: `/gastos?error=${encodeURIComponent(t('errorDescripcionObligatoria'))}`, locale });
  }
  if (descripcion.length > MAX_DESCRIPCION) {
    redirect({
      href: `/gastos?error=${encodeURIComponent(t('errorDescripcionLarga', { max: MAX_DESCRIPCION }))}`,
      locale,
    });
  }

  const monto = Number(montoRaw);
  if (!monto || monto <= 0) {
    redirect({ href: `/gastos?error=${encodeURIComponent(t('errorMontoObligatorio'))}`, locale });
  }
  if (monto > MONTO_MAXIMO) {
    redirect({ href: `/gastos?error=${encodeURIComponent(t('errorMontoGrande'))}`, locale });
  }

  // El <select> de "quién pagó" solo lista miembros de la casa, pero
  // eso no evita un formulario tamperado — mismo motivo que la
  // validación de asignado_a en tareas (ver auth/actions.ts).
  const miembros = await getMiembrosCasaActiva();
  if (!miembros.some((m) => m.usuario_id === pagadoPor)) {
    redirect({ href: `/gastos?error=${encodeURIComponent(t('errorPagadoInvalido'))}`, locale });
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
    redirect({ href: `/gastos?error=${encodeURIComponent(error.message)}`, locale });
  }

  await notificarNuevoGasto(user.id, descripcion, monto);

  redirect({ href: '/gastos', locale });
}

export async function eliminarGasto(gastoId: string) {
  const locale = (await getLocale()) as Locale;
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  await supabase.from('gastos').delete().eq('id', gastoId).eq('casa_id', casa.id);

  redirect({ href: '/gastos', locale });
}

// Quien confirma un pago es siempre quien está haciendo la acción — no
// se puede registrar "a nombre de" otro miembro. Antes cualquiera podía
// elegir tanto "quién pagó" como "a quién" libremente, así que el
// propio deudor podía autodeclararse "ya pagué" sin que la otra
// persona confirmara nada. Ahora el balance solo se mueve cuando
// quien de verdad recibió el dinero lo confirma — sigue sin haber
// comprobante de por medio, pero ya no es un solo lado el que decide.
export async function registrarPago(formData: FormData) {
  const t = await getTranslations('Gastos');
  const locale = (await getLocale()) as Locale;
  const casa = await getCasaActivaOrRedirect();
  const { supabase, user } = await getSesion();

  const deUsuarioId = String(formData.get('de_usuario_id') ?? '').trim();
  const aUsuarioId = user.id;
  const montoRaw = String(formData.get('monto') ?? '').trim();
  const fecha = String(formData.get('fecha') ?? '').trim();

  const monto = Number(montoRaw);
  if (!monto || monto <= 0) {
    redirect({ href: `/gastos?error=${encodeURIComponent(t('errorMontoPagoObligatorio'))}`, locale });
  }
  if (monto > MONTO_MAXIMO) {
    redirect({ href: `/gastos?error=${encodeURIComponent(t('errorMontoGrande'))}`, locale });
  }
  if (!deUsuarioId || deUsuarioId === aUsuarioId) {
    redirect({ href: `/gastos?error=${encodeURIComponent(t('errorMismaPersona'))}`, locale });
  }

  const miembros = await getMiembrosCasaActiva();
  if (!miembros.some((m) => m.usuario_id === deUsuarioId)) {
    redirect({ href: `/gastos?error=${encodeURIComponent(t('errorPagoInvalido'))}`, locale });
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
    redirect({ href: `/gastos?error=${encodeURIComponent(error.message)}`, locale });
  }

  await notificarPagoConfirmado(deUsuarioId, monto);

  redirect({ href: '/gastos', locale });
}

export async function eliminarPago(pagoId: string) {
  const locale = (await getLocale()) as Locale;
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  await supabase.from('pagos').delete().eq('id', pagoId).eq('casa_id', casa.id);

  redirect({ href: '/gastos', locale });
}
