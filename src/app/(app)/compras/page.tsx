import { getCasaActivaOrRedirect } from '@/lib/casas/data';
import { getListaCompras } from '@/lib/compras/data';
import { agregarItemCompra, alternarComprado, eliminarItemCompra, limpiarComprados } from './actions';
import { Input } from '@/components/ui/Input';
import { SubmitButton } from '@/components/ui/SubmitButton';

export default async function ComprasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [casa, items, { error }] = await Promise.all([
    getCasaActivaOrRedirect(),
    getListaCompras(),
    searchParams,
  ]);

  const pendientes = items.filter((item) => !item.comprado);
  const comprados = items.filter((item) => item.comprado);

  return (
    <main className="flex flex-1 bg-[radial-gradient(circle_at_top_left,_rgba(178,150,125,0.3),_transparent_34%)] bg-linen px-4 py-8">
      <section className="mx-auto w-full max-w-2xl space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">Lista de compras</p>
          <h1 className="mt-1 text-2xl font-bold text-cocoa">{casa.nombre}</h1>
        </div>

        {error && (
          <p className="rounded-lg border border-[#a8422e] bg-[#a8422e]/10 px-3 py-2 text-sm font-medium text-[#a8422e]">
            {error}
          </p>
        )}

        <form action={agregarItemCompra} className="flex items-end gap-3">
          <div className="min-w-0 flex-1">
            <Input label="Agregar a la lista" name="nombre" placeholder="Ej. Leche, papel de baño…" maxLength={100} required />
          </div>
          <SubmitButton pendingText="Agregando…">+ Agregar</SubmitButton>
        </form>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-camel bg-khaki/50 p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-cocoa">La lista está vacía. Agrega lo primero que necesiten.</p>
          </div>
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
                        <span className="truncate text-sm font-medium text-cocoa">{item.nombre}</span>
                      </button>
                    </form>
                    <form action={eliminarItemCompra.bind(null, item.id)}>
                      <SubmitButton variant="secondary" className="min-h-0 px-2 py-1 text-xs" pendingText="…">
                        Quitar
                      </SubmitButton>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            {comprados.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-cocoa/70">Comprado ({comprados.length})</h2>
                  <form action={limpiarComprados}>
                    <SubmitButton variant="secondary" className="min-h-0 px-2 py-1 text-xs" pendingText="Limpiando…">
                      Limpiar
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
                          <span className="truncate text-sm font-medium text-cocoa/60 line-through">{item.nombre}</span>
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
