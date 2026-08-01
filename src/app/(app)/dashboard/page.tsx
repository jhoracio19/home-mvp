import Link from 'next/link';
import { getCasaActivaOrRedirect } from '@/lib/casas/data';
import { getItemsRefri } from '@/lib/refri/data';
import { eliminarItem } from '@/app/(app)/refri/actions';
import {
  calcularDiasRestantes,
  calcularFechaVencimiento,
  clasificarUrgencia,
  etiquetaUrgencia,
  type Urgencia,
} from '@/lib/refri/urgencia';
import { CATEGORIAS, COLOR_CATEGORIA, etiquetaCategoria } from '@/lib/refri/categorias';
import { buttonClasses } from '@/components/ui/Button';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormBusqueda } from '@/components/ui/FormBusqueda';

const ESTILOS_URGENCIA: Record<Urgencia, string> = {
  vencido: 'border-[#a8422e] bg-[#a8422e]/10 text-[#a8422e] dark:bg-[#a8422e]/15 dark:text-[#e3a999]',
  hoy: 'border-[#c9702f] bg-[#c9702f]/10 text-[#c9702f] dark:bg-[#c9702f]/15 dark:text-[#f0b988]',
  pronto: 'border-camel bg-camel/15 text-cocoa dark:bg-camel/10 dark:text-camel',
  normal: 'border-camel bg-khaki text-cocoa dark:border-cocoa dark:bg-[#3a2820] dark:text-khaki',
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const [casaActiva, items, { q, categoria }] = await Promise.all([
    getCasaActivaOrRedirect(),
    getItemsRefri(),
    searchParams,
  ]);

  const busqueda = (q ?? '').trim().toLowerCase();

  const itemsConUrgencia = items
    .filter((item) => {
      if (busqueda && !item.nombre.toLowerCase().includes(busqueda)) return false;
      if (categoria && item.categoria !== categoria) return false;
      return true;
    })
    .map((item) => {
      const vencimiento = calcularFechaVencimiento(item);
      const diasRestantes = calcularDiasRestantes(vencimiento);
      return { item, diasRestantes, urgencia: clasificarUrgencia(diasRestantes) };
    })
    .sort((a, b) => a.diasRestantes - b.diasRestantes);

  const hayFiltros = Boolean(busqueda || categoria);

  return (
    <main className="flex flex-1 bg-[radial-gradient(circle_at_top_left,_rgba(178,150,125,0.3),_transparent_34%)] bg-linen px-4 py-8 dark:bg-none dark:bg-espresso">
      <section className="mx-auto w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">Refri</p>
            <h1 className="mt-1 text-2xl font-bold text-cocoa dark:text-linen">{casaActiva.nombre}</h1>
          </div>
          <Link href="/refri/nuevo" className={buttonClasses('primary')}>
            + Agregar
          </Link>
        </div>

        {(items.length > 0 || hayFiltros) && (
          <FormBusqueda>
            <div className="min-w-0 flex-1">
              <Input label="Buscar" name="q" defaultValue={q ?? ''} placeholder="Nombre del producto" />
            </div>
            <div className="w-36 shrink-0">
              <Select label="Categoría" name="categoria" defaultValue={categoria ?? ''}>
                <option value="">Todas</option>
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
          </FormBusqueda>
        )}

        {itemsConUrgencia.length === 0 ? (
          <div className="rounded-lg border border-dashed border-camel bg-khaki/50 p-6 text-center shadow-sm dark:border-khaki/30 dark:bg-[#3a2820]/70">
            <p className="text-sm font-medium text-cocoa dark:text-khaki">
              {hayFiltros ? 'Nada coincide con esa búsqueda.' : 'Tu refri está vacío. Agrega el primer producto.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {itemsConUrgencia.map(({ item, diasRestantes, urgencia }) => (
              <li
                key={item.id}
                className={`rounded-lg border-2 p-4 shadow-sm ${ESTILOS_URGENCIA[urgencia]}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-cocoa dark:text-linen">{item.nombre}</p>
                    <span
                      className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${COLOR_CATEGORIA[item.categoria]}`}
                    >
                      {etiquetaCategoria(item.categoria)}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/60 px-2 py-1 text-xs font-bold dark:bg-black/20">
                    {etiquetaUrgencia(diasRestantes)}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Link
                    href={`/refri/${item.id}/editar`}
                    className="text-xs font-semibold text-camel hover:underline"
                  >
                    Editar
                  </Link>
                  <form action={eliminarItem.bind(null, item.id)}>
                    <SubmitButton
                      variant="secondary"
                      className="min-h-0 px-2 py-1 text-xs"
                      pendingText="Eliminando…"
                      confirmMessage={`¿Eliminar "${item.nombre}" del refri?`}
                    >
                      Eliminar
                    </SubmitButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
