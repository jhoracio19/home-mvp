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
import { etiquetaCategoria } from '@/lib/refri/categorias';
import { buttonClasses } from '@/components/ui/Button';
import { SubmitButton } from '@/components/ui/SubmitButton';

const ESTILOS_URGENCIA: Record<Urgencia, string> = {
  vencido: 'border-[#a8422e] bg-[#a8422e]/10 text-[#a8422e] dark:bg-[#a8422e]/15 dark:text-[#e3a999]',
  hoy: 'border-[#c9702f] bg-[#c9702f]/10 text-[#c9702f] dark:bg-[#c9702f]/15 dark:text-[#f0b988]',
  pronto: 'border-camel bg-camel/15 text-cocoa dark:bg-camel/10 dark:text-camel',
  normal: 'border-khaki bg-linen text-cocoa dark:border-cocoa dark:bg-[#3a2820] dark:text-khaki',
};

export default async function DashboardPage() {
  const casaActiva = await getCasaActivaOrRedirect();
  const items = await getItemsRefri();

  const itemsConUrgencia = items
    .map((item) => {
      const vencimiento = calcularFechaVencimiento(item);
      const diasRestantes = calcularDiasRestantes(vencimiento);
      return { item, diasRestantes, urgencia: clasificarUrgencia(diasRestantes) };
    })
    .sort((a, b) => a.diasRestantes - b.diasRestantes);

  return (
    <main className="flex flex-1 bg-[linear-gradient(180deg,_#F5F1EA_0%,_#D7C9B8_100%)] px-4 py-8 dark:bg-none dark:bg-espresso">
      <section className="mx-auto w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">Refri</p>
            <h1 className="mt-1 text-2xl font-bold text-espresso dark:text-linen">{casaActiva.nombre}</h1>
          </div>
          <Link href="/refri/nuevo" className={buttonClasses('primary')}>
            + Agregar
          </Link>
        </div>

        {itemsConUrgencia.length === 0 ? (
          <div className="rounded-lg border border-dashed border-cocoa/40 bg-linen/70 p-6 text-center shadow-sm dark:border-khaki/30 dark:bg-[#3a2820]/70">
            <p className="text-sm font-medium text-cocoa dark:text-khaki">
              Tu refri está vacío. Agrega el primer producto.
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
                    <p className="truncate font-semibold text-espresso dark:text-linen">{item.nombre}</p>
                    <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                      {etiquetaCategoria(item.categoria)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/60 px-2 py-1 text-xs font-bold dark:bg-black/20">
                    {etiquetaUrgencia(diasRestantes)}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Link
                    href={`/refri/${item.id}/editar`}
                    className="text-xs font-semibold text-cocoa hover:underline dark:text-camel"
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
