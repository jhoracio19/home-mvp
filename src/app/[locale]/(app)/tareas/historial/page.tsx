import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCasaActivaOrRedirect } from '@/lib/casas/data';
import { getHistorialTareas } from '@/lib/tareas/data';
import { intlLocale } from '@/lib/intl-locale';
import type { Locale } from '@/i18n/routing';

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
    <main className="flex flex-1 justify-center bg-[radial-gradient(circle_at_top_left,_rgba(178,150,125,0.3),_transparent_34%)] bg-linen px-4 py-8">
      <section className="w-full max-w-2xl space-y-6">
        <Link href="/tareas" className="inline-flex items-center gap-1 text-sm font-semibold text-cocoa hover:underline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {t('volver')}
        </Link>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">{casa.nombre}</p>
          <h1 className="mt-1 text-2xl font-bold text-cocoa">{t('historialTitulo')}</h1>
        </div>

        {historial.length === 0 ? (
          <div className="rounded-lg border border-dashed border-camel bg-khaki/50 p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-cocoa">{t('sinHistorial')}</p>
          </div>
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
