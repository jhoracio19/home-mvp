import Link from 'next/link';
import { getCasaActivaOrRedirect, getMiembrosCasaActiva } from '@/lib/casas/data';
import { nombreMiembro } from '@/lib/casas/nombre-miembro';
import { getTareas } from '@/lib/tareas/data';
import { completarTarea, eliminarTarea } from './actions';
import { calcularProximaFecha } from '@/lib/tareas/urgencia';
import { etiquetaDiasSemana } from '@/lib/tareas/dias-semana';
import { calcularDiasRestantes, clasificarUrgencia, etiquetaUrgencia, type Urgencia } from '@/lib/urgencia';
import { buttonClasses } from '@/components/ui/Button';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Input } from '@/components/ui/Input';
import { FormBusqueda } from '@/components/ui/FormBusqueda';
import { EscuchaRealtime } from '@/components/realtime/EscuchaRealtime';

const ESTILOS_URGENCIA: Record<Urgencia, string> = {
  vencido: 'border-[#a8422e] bg-[#a8422e]/10 text-[#a8422e] dark:bg-[#a8422e]/15 dark:text-[#e3a999]',
  hoy: 'border-[#c9702f] bg-[#c9702f]/10 text-[#c9702f] dark:bg-[#c9702f]/15 dark:text-[#f0b988]',
  pronto: 'border-camel bg-camel/15 text-cocoa dark:bg-camel/10 dark:text-camel',
  normal: 'border-camel bg-khaki text-cocoa dark:border-cocoa dark:bg-[#3a2820] dark:text-khaki',
};

export default async function TareasPage({
  searchParams,
}: {
  searchParams: Promise<{ completada?: string; proxima?: string; completadaId?: string; q?: string }>;
}) {
  const [casa, tareas, miembros, { completada, proxima, completadaId, q }] = await Promise.all([
    getCasaActivaOrRedirect(),
    getTareas(),
    getMiembrosCasaActiva(),
    searchParams,
  ]);
  const nombrePorId = new Map(miembros.map((m) => [m.usuario_id, nombreMiembro(m)]));

  const busqueda = (q ?? '').trim().toLowerCase();
  const hayFiltros = Boolean(busqueda);

  const tareasConUrgencia = tareas
    .filter((tarea) => !busqueda || tarea.nombre.toLowerCase().includes(busqueda))
    .map((tarea) => {
      const proximaFecha = calcularProximaFecha(tarea);
      const diasRestantes = calcularDiasRestantes(proximaFecha);
      return { tarea, diasRestantes, urgencia: clasificarUrgencia(diasRestantes) };
    })
    .sort((a, b) => a.diasRestantes - b.diasRestantes);

  return (
    <main className="flex flex-1 bg-[radial-gradient(circle_at_top_left,_rgba(178,150,125,0.3),_transparent_34%)] bg-linen px-4 py-8 dark:bg-none dark:bg-espresso">
      <EscuchaRealtime tabla="tareas" casaId={casa.id} />
      <section className="mx-auto w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">Tareas</p>
            <h1 className="mt-1 text-2xl font-bold text-cocoa dark:text-linen">Pendientes de la casa</h1>
          </div>
          <Link href="/tareas/nueva" className={buttonClasses('primary')}>
            + Nueva
          </Link>
        </div>

        <Link href="/tareas/historial" className="inline-block text-xs font-semibold text-camel hover:underline">
          Ver historial de tareas completadas
        </Link>

        {completada && (
          <p className="flex items-center gap-2 rounded-lg border-2 border-camel bg-camel/25 px-4 py-3 text-sm font-semibold text-cocoa dark:text-linen">
            <span aria-hidden className="text-lg">
              ✓
            </span>
            <span>
              Marcaste &ldquo;{completada}&rdquo; como hecha.
              {proxima && ` Próxima vez: ${proxima}.`}
            </span>
          </p>
        )}

        {(tareas.length > 0 || hayFiltros) && (
          <FormBusqueda>
            <div className="min-w-0 flex-1">
              <Input label="Buscar" name="q" defaultValue={q ?? ''} placeholder="Nombre de la tarea" />
            </div>
          </FormBusqueda>
        )}

        {tareasConUrgencia.length === 0 ? (
          <div className="rounded-lg border border-dashed border-camel bg-khaki/50 p-6 text-center shadow-sm dark:border-khaki/30 dark:bg-[#3a2820]/70">
            <p className="text-sm font-medium text-cocoa dark:text-khaki">
              {hayFiltros ? 'Nada coincide con esa búsqueda.' : 'Aún no hay tareas recurrentes. Crea la primera.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {tareasConUrgencia.map(({ tarea, diasRestantes, urgencia }) => (
              <li
                key={tarea.id}
                className={`rounded-lg border-2 p-4 shadow-sm ${ESTILOS_URGENCIA[urgencia]} ${
                  tarea.id === completadaId ? 'destacar-confirmacion' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-cocoa dark:text-linen">{tarea.nombre}</p>
                    <p className="text-xs font-medium opacity-70">
                      {tarea.tipo_frecuencia === 'dias_semana'
                        ? etiquetaDiasSemana(tarea.dias_semana ?? [])
                        : `Cada ${tarea.frecuencia_dias} ${tarea.frecuencia_dias === 1 ? 'día' : 'días'}`}
                      {' · '}
                      {tarea.asignado_a ? (nombrePorId.get(tarea.asignado_a) ?? 'Miembro') : 'Sin asignar'}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/60 px-2 py-1 text-xs font-bold dark:bg-black/20">
                    {etiquetaUrgencia(diasRestantes)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <form action={completarTarea.bind(null, tarea.id)}>
                    <SubmitButton className="min-h-0 px-3 py-1.5 text-xs" pendingText="Marcando…">
                      Marcar hecho
                    </SubmitButton>
                  </form>
                  <Link
                    href={`/tareas/${tarea.id}/editar`}
                    className="text-xs font-semibold text-camel hover:underline"
                  >
                    Editar
                  </Link>
                  <form action={eliminarTarea.bind(null, tarea.id)}>
                    <SubmitButton
                      variant="secondary"
                      className="min-h-0 px-2 py-1 text-xs"
                      pendingText="Eliminando…"
                      confirmMessage={`¿Eliminar la tarea "${tarea.nombre}"?`}
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
