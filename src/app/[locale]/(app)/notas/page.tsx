import { getLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { getCasaActivaOrRedirect } from '@/lib/casas/data';
import { getNotaCasa } from '@/lib/notas/data';
import { intlLocale } from '@/lib/intl-locale';
import { actualizarNotaCasa } from './actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alerta } from '@/components/ui/Alerta';
import { BotonVolver } from '@/components/layout/BotonVolver';
import { EscuchaRealtime } from '@/components/realtime/EscuchaRealtime';

export default async function NotasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const [casa, nota, { error, message }, t, locale] = await Promise.all([
    getCasaActivaOrRedirect(),
    getNotaCasa(),
    searchParams,
    getTranslations('Notas'),
    getLocale() as Promise<Locale>,
  ]);

  const formatoFecha = new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Mexico_City',
  });

  return (
    <main className="flex flex-1 justify-center fondo-pagina px-4 py-8">
      <EscuchaRealtime tabla="notas_casa" casaId={casa.id} />
      <section className="w-full max-w-2xl space-y-6">
        <BotonVolver href="/dashboard">{t('volver')}</BotonVolver>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">{casa.nombre}</p>
          <h1 className="mt-1 text-2xl font-bold text-cocoa">{t('titulo')}</h1>
          <p className="mt-1 text-sm text-cocoa/70">{t('descripcion')}</p>
        </div>

        {message && <Alerta variante="info">{message}</Alerta>}
        {error && <Alerta variante="error">{error}</Alerta>}

        <form action={actualizarNotaCasa} className="space-y-3">
          <label htmlFor="contenido" className="sr-only">
            {t('notasDeLaCasaSr')}
          </label>
          <textarea
            id="contenido"
            name="contenido"
            defaultValue={nota?.contenido ?? ''}
            maxLength={5000}
            rows={14}
            placeholder={t('placeholder')}
            className="w-full rounded-lg border border-camel bg-linen px-4 py-3 text-sm leading-relaxed text-cocoa shadow-sm placeholder:text-cocoa/50 focus:border-espresso focus:outline-none focus:ring-2 focus:ring-camel/35"
          />
          <div className="flex items-center justify-between gap-3">
            {nota?.actualizado_en ? (
              <p className="text-xs text-cocoa/60">
                {t('ultimaActualizacion', { fecha: formatoFecha.format(new Date(nota.actualizado_en)) })}
              </p>
            ) : (
              <span />
            )}
            <SubmitButton pendingText={t('guardando')}>{t('guardar')}</SubmitButton>
          </div>
        </form>
      </section>
    </main>
  );
}
