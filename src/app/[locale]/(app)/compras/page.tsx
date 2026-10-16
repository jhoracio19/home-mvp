import { getTranslations } from 'next-intl/server';
import { getCasaActivaOrRedirect } from '@/lib/casas/data';
import { getListaCompras } from '@/lib/compras/data';
import { agregarItemCompra, alternarComprado, eliminarItemCompra, limpiarComprados } from './actions';
import { Input } from '@/components/ui/Input';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alerta } from '@/components/ui/Alerta';
import { EmptyState } from '@/components/ui/EmptyState';
import { EscuchaRealtime } from '@/components/realtime/EscuchaRealtime';

export default async function ComprasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const [casa, items, { error, message }, t] = await Promise.all([
    getCasaActivaOrRedirect(),
    getListaCompras(),
    searchParams,
    getTranslations('Compras'),
  ]);

  const pendientes = items.filter((item) => !item.comprado);
  const comprados = items.filter((item) => item.comprado);

  return (
    <main className="flex flex-1 fondo-pagina px-4 py-8">
      <EscuchaRealtime tabla="lista_compras" casaId={casa.id} />
      <section className="mx-auto w-full max-w-2xl space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">{t('eyebrow')}</p>
          <h1 className="mt-1 text-2xl font-bold text-cocoa">{casa.nombre}</h1>
        </div>

        {message && <Alerta variante="info">{message}</Alerta>}
        {error && <Alerta variante="error">{error}</Alerta>}

        <form action={agregarItemCompra} className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">
            <Input label={t('agregarALaLista')} name="nombre" placeholder={t('ejemploProducto')} maxLength={100} required />
          </div>
          <div className="w-28 shrink-0">
            <Input label={t('cantidad')} name="cantidad" placeholder={t('ejemploCantidad')} maxLength={30} />
          </div>
          <SubmitButton pendingText={t('agregando')}>{t('agregar')}</SubmitButton>
        </form>

        {items.length === 0 ? (
          <EmptyState titulo={t('listaVacia')} />
        ) : (
          <>
            {pendientes.length > 0 && (
              <ul className="space-y-2">
                {pendientes.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-camel bg-khaki px-4 py-3 shadow-sm"
                  >
                    <form action={alternarComprado.bind(null, item.id, true)} className="min-w-0 flex-1">
                      <button type="submit" className="flex w-full items-center gap-3 text-left">
                        <span className="h-5 w-5 shrink-0 rounded-full border-2 border-camel" />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-cocoa">
                          {item.nombre}
                          {item.cantidad && <span className="text-cocoa/60"> · {item.cantidad}</span>}
                        </span>
                      </button>
                    </form>
                    <form action={eliminarItemCompra.bind(null, item.id)}>
                      <SubmitButton
                        variant="secondary"
                        size="sm"
                        pendingText="…"
                        confirmMessage={t('confirmarQuitar', { nombre: item.nombre })}
                      >
                        {t('quitar')}
                      </SubmitButton>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            {comprados.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-cocoa/70">{t('comprado', { n: comprados.length })}</h2>
                  <form action={limpiarComprados}>
                    <SubmitButton variant="secondary" size="sm" pendingText={t('limpiando')}>
                      {t('limpiar')}
                    </SubmitButton>
                  </form>
                </div>
                <ul className="space-y-2">
                  {comprados.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-camel/50 bg-khaki/40 px-4 py-3"
                    >
                      <form action={alternarComprado.bind(null, item.id, false)} className="min-w-0 flex-1">
                        <button type="submit" className="flex w-full items-center gap-3 text-left">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-cocoa bg-cocoa text-linen">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-3 w-3"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-cocoa/60 line-through">
                            {item.nombre}
                            {item.cantidad && <span> · {item.cantidad}</span>}
                          </span>
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
