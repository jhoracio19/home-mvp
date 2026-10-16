import { getLocale, getTranslations } from 'next-intl/server';
import { getCasaActivaOrRedirect } from '@/lib/casas/data';
import { getHistorialTareas } from '@/lib/tareas/data';
import { intlLocale } from '@/lib/intl-locale';
import type { Locale } from '@/i18n/routing';
import { EmptyState } from '@/components/ui/EmptyState';
import { BotonVolver } from '@/components/layout/BotonVolver';

export default async function HistorialTareasPage() {
  const [casa, historial, t, locale] = await Promise.all([
    getCasaActivaOrRedirect(),
    getHistorialTareas(),
    getTranslations('Tareas'),
    getLocale() as Promise<Locale>,
  ]);

  const formatoFecha = new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Mexico_City',
  });

  return (
    <main className="flex flex-1 justify-center fondo-pagina px-4 py-8">
      <section className="w-full max-w-2xl space-y-6">
        <BotonVolver href="/tareas">{t('volver')}</BotonVolver>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">{casa.nombre}</p>
          <h1 className="mt-1 text-2xl font-bold text-cocoa">{t('historialTitulo')}</h1>
        </div>

        {historial.length === 0 ? (
          <EmptyState titulo={t('sinHistorial')} />
        ) : (
          <ul className="space-y-2">
            {historial.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-camel bg-khaki px-4 py-3 text-sm shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-cocoa">{h.nombre_tarea}</p>
                  <p className="truncate text-xs text-cocoa/70">{h.nombre_usuario}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-cocoa/70">
                  {formatoFecha.format(new Date(h.completada_en))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
