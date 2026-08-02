import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getCasaActivaOrRedirect, getMiembrosCasaActiva } from '@/lib/casas/data';
import { nombreMiembro } from '@/lib/casas/nombre-miembro';
import { getGastos } from '@/lib/gastos/data';
import { agruparPorMes } from '@/lib/gastos/resumen';
import { intlLocale } from '@/lib/intl-locale';

export default async function ResumenGastosPage() {
  const [casa, gastos, miembros, t, locale] = await Promise.all([
    getCasaActivaOrRedirect(),
    getGastos(),
    getMiembrosCasaActiva(),
    getTranslations('ResumenGastos'),
    getLocale() as Promise<Locale>,
  ]);

  const formatoMoneda = new Intl.NumberFormat(intlLocale(locale), { style: 'currency', currency: 'MXN' });
  const meses = agruparPorMes(gastos, locale);

  return (
    <main className="flex flex-1 justify-center bg-[radial-gradient(circle_at_top_left,_rgba(178,150,125,0.3),_transparent_34%)] bg-linen px-4 py-8">
      <section className="w-full max-w-2xl space-y-6">
        <Link href="/gastos" className="inline-flex items-center gap-1 text-sm font-semibold text-cocoa hover:underline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {t('volver')}
        </Link>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">{casa.nombre}</p>
          <h1 className="mt-1 text-2xl font-bold text-cocoa">{t('titulo')}</h1>
          <p className="mt-1 text-sm text-cocoa/70">{t('descripcion')}</p>
        </div>

        {meses.length === 0 ? (
          <div className="rounded-lg border border-dashed border-camel bg-khaki/50 p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-cocoa">{t('sinResumen')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meses.map((mes) => (
              <div key={mes.clave} className="rounded-lg border border-camel bg-khaki p-4 shadow-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-sm font-bold text-cocoa">{mes.etiqueta}</h2>
                  <span className="text-lg font-bold text-cocoa">{formatoMoneda.format(mes.total)}</span>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {[...mes.porPersona.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .map(([usuarioId, monto]) => {
                      const miembro = miembros.find((m) => m.usuario_id === usuarioId);
                      const porcentaje = mes.total > 0 ? Math.round((monto / mes.total) * 100) : 0;
                      return (
                        <li key={usuarioId} className="flex items-center justify-between gap-3 text-sm">
                          <span className="truncate text-cocoa">{miembro ? nombreMiembro(miembro) : t('alguien')}</span>
                          <span className="shrink-0 text-cocoa/70">
                            {formatoMoneda.format(monto)} <span className="text-cocoa/50">({porcentaje}%)</span>
                          </span>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
