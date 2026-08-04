import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { intlLocale } from '@/lib/intl-locale';
import { enviarNotificacionAUsuario } from '@/lib/notificaciones/enviar';

function formatoMonedaPara(locale: Locale) {
  return new Intl.NumberFormat(intlLocale(locale), { style: 'currency', currency: 'MXN' });
}

// Compartido entre gastos/actions.ts (registrarPago, flujo normal) y
// la API de /api/gastos/marcar-pagado (confirmación desde el botón del
// push) — ambos caminos terminan en el mismo aviso al deudor.
export async function notificarPagoConfirmado(deUsuarioId: string, monto: number) {
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
