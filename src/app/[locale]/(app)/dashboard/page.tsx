import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCasaActivaOrRedirect, getMiembrosCasaActiva } from '@/lib/casas/data';
import { nombreMiembro } from '@/lib/casas/nombre-miembro';
import { getItemsRefri } from '@/lib/refri/data';
import { eliminarItem } from '@/app/[locale]/(app)/refri/actions';
import { agregarALista } from '@/app/[locale]/(app)/compras/actions';
import {
  calcularDiasRestantes,
  calcularFechaVencimiento,
  clasificarUrgencia,
  etiquetaUrgencia,
} from '@/lib/refri/urgencia';
import { ESTILOS_URGENCIA } from '@/lib/urgencia';
import { categorias, COLOR_CATEGORIA, etiquetaCategoria } from '@/lib/refri/categorias';
import { buttonClasses } from '@/components/ui/Button';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormBusqueda } from '@/components/ui/FormBusqueda';
import { EmptyState } from '@/components/ui/EmptyState';
import { EscuchaRealtime } from '@/components/realtime/EscuchaRealtime';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; dueno?: string; agregado?: string; yaExistia?: string }>;
}) {
  const [casaActiva, items, miembros, { q, categoria, dueno, agregado, yaExistia }, tUrgencia, t, tCategorias] =
    await Promise.all([
      getCasaActivaOrRedirect(),
      getItemsRefri(),
      getMiembrosCasaActiva(),
      searchParams,
      getTranslations('Urgencia'),
      getTranslations('Refri'),
      getTranslations('Categorias'),
    ]);

  const nombrePorId = new Map(miembros.map((m) => [m.usuario_id, nombreMiembro(m)]));
  const busqueda = (q ?? '').trim().toLowerCase();

  const itemsConUrgencia = items
    .filter((item) => {
      if (busqueda && !item.nombre.toLowerCase().includes(busqueda)) return false;
      if (categoria && item.categoria !== categoria) return false;
      if (dueno && item.pertenece_a !== dueno) return false;
      return true;
    })
    .map((item) => {
      const vencimiento = calcularFechaVencimiento(item);
      const diasRestantes = calcularDiasRestantes(vencimiento);
      return { item, diasRestantes, urgencia: clasificarUrgencia(diasRestantes) };
    })
    .sort((a, b) => a.diasRestantes - b.diasRestantes);

  const hayFiltros = Boolean(busqueda || categoria || dueno);

  return (
    <main className="flex flex-1 fondo-pagina px-4 py-8 dark:bg-none dark:bg-espresso">
      <EscuchaRealtime tabla="items_refri" casaId={casaActiva.id} />
      <section className="mx-auto w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">{t('eyebrow')}</p>
            <h1 className="mt-1 text-2xl font-bold text-cocoa dark:text-linen">{casaActiva.nombre}</h1>
          </div>
          <Link href="/refri/nuevo" className={buttonClasses('primary')}>
            {t('agregar')}
          </Link>
        </div>

        {agregado && (
          <p className="rounded-lg border-2 border-camel bg-camel/25 px-4 py-3 text-sm font-semibold text-cocoa">
            {yaExistia ? t('yaEnLista', { nombre: agregado }) : t('seAgrego', { nombre: agregado })}
          </p>
        )}

        {(items.length > 0 || hayFiltros) && (
          <FormBusqueda>
            <div className="w-36 shrink-0">
              <Select label={t('categoria')} name="categoria" defaultValue={categoria ?? ''}>
                <option value="">{t('todas')}</option>
                {categorias(tCategorias).map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-36 shrink-0">
              <Select label={t('deQuien')} name="dueno" defaultValue={dueno ?? ''}>
                <option value="">{t('todosLosDuenos')}</option>
                {miembros.map((m) => (
                  <option key={m.usuario_id} value={m.usuario_id}>
                    {nombreMiembro(m)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-full">
              <Input label={t('buscar')} name="q" defaultValue={q ?? ''} placeholder={t('nombreDelProducto')} />
            </div>
          </FormBusqueda>
        )}

        {itemsConUrgencia.length === 0 ? (
          <EmptyState
            titulo={hayFiltros ? t('nadaCoincide') : t('refriVacio')}
            accion={
              !hayFiltros && (
                <Link href="/refri/nuevo" className={buttonClasses('secondary', '', 'sm')}>
                  {t('agregar')}
                </Link>
              )
            }
          />
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
                      {etiquetaCategoria(item.categoria, tCategorias)}
                    </span>
                    {item.pertenece_a && (
                      <span className="ml-1.5 mt-1 inline-block rounded-full border border-cocoa/40 bg-overlay/50 px-2 py-0.5 text-[0.65rem] font-bold text-cocoa dark:border-khaki/30 dark:bg-black/20 dark:text-khaki">
                        {nombrePorId.get(item.pertenece_a) ?? t('miembro')}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-overlay/60 px-2 py-1 text-xs font-bold dark:bg-black/20">
                    {etiquetaUrgencia(diasRestantes, tUrgencia)}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <form action={agregarALista.bind(null, item.nombre)}>
                    <SubmitButton
                      variant="secondary"
                      size="sm"
                      pendingText={t('agregandoLista')}
                    >
                      {t('masLista')}
                    </SubmitButton>
                  </form>
                  <Link
                    href={`/refri/${item.id}/editar`}
                    className="text-xs font-semibold text-camel hover:underline"
                  >
                    {t('editar')}
                  </Link>
                  <form action={eliminarItem.bind(null, item.id)}>
                    <SubmitButton
                      variant="secondary"
                      size="sm"
                      pendingText={t('eliminando')}
                      confirmMessage={t('confirmarEliminar', { nombre: item.nombre })}
                    >
                      {t('eliminar')}
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
