import { requireAdmin } from '@/lib/admin/auth';
import { getEstadisticasAdmin } from '@/lib/admin/data';
import { MenuAdmin } from '@/components/layout/MenuAdmin';

function formatearFecha(iso: string) {
  return new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}

// Envoltorio visual para cada bloque del panel: sin esto, todas las
// secciones flotaban sueltas sobre el mismo fondo y se veían como un
// solo bloque de texto continuo en vez de módulos separados.
function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-camel/50 bg-khaki/30 p-5 shadow-sm dark:border-khaki/15 dark:bg-[#3a2820]/40">
      <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-cocoa/80 dark:text-khaki/80">{titulo}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Tarjeta({ etiqueta, valor, detalle }: { etiqueta: string; valor: string | number; detalle?: string }) {
  return (
    <div className="rounded-lg border border-camel/40 bg-linen p-4 shadow-sm dark:border-khaki/20 dark:bg-espresso/60">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-camel">{etiqueta}</p>
      <p className="mt-1 text-2xl font-bold text-cocoa dark:text-linen">{valor}</p>
      {detalle && <p className="mt-0.5 text-xs text-cocoa/70 dark:text-khaki/70">{detalle}</p>}
    </div>
  );
}

export default async function AdminPage() {
  const user = await requireAdmin();
  const { resumen, registrosPorDia, usoPorFuncion, usuariosMasActivos, actividadReciente } =
    await getEstadisticasAdmin();

  const maxUso = Math.max(...usoPorFuncion.map((u) => u.total), 1);
  const maxActividad = Math.max(...usuariosMasActivos.map((u) => u.total), 1);
  const maxRegistros = Math.max(...registrosPorDia.map(([, n]) => n), 1);

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-linen dark:bg-espresso">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-espresso px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] shadow-md">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-linen">Panel de superusuario</p>
          <p className="truncate text-xs text-khaki">{user.email}</p>
        </div>
        <MenuAdmin />
      </header>

      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">Superusuario</p>
          <h1 className="mt-1 text-2xl font-bold text-cocoa dark:text-linen">Actividad de la app</h1>
          <p className="mt-1 text-sm text-cocoa/70 dark:text-khaki/70">
            Datos en vivo de Supabase. Refresca la página para ver lo más reciente.
          </p>
        </div>

        <Seccion titulo="Resumen">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Tarjeta etiqueta="Usuarios registrados" valor={resumen.totalUsuarios} />
            <Tarjeta
              etiqueta="Con actividad real"
              valor={resumen.usuariosConActividad}
              detalle={`de ${resumen.totalUsuarios} registrados`}
            />
            <Tarjeta etiqueta="Nunca volvieron a entrar" valor={resumen.usuariosNuncaVolvieron} />
            <Tarjeta etiqueta="Casas creadas" valor={resumen.totalCasas} />
            <Tarjeta
              etiqueta="Casas con 2+ miembros"
              valor={resumen.casasMultiMiembro}
              detalle={`de ${resumen.totalCasas} casas`}
            />
          </div>
        </Seccion>

        <Seccion titulo="Últimas señales">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {resumen.ultimoUsuarioRegistrado && (
              <Tarjeta
                etiqueta="Último usuario registrado"
                valor={resumen.ultimoUsuarioRegistrado.nombre}
                detalle={formatearFecha(resumen.ultimoUsuarioRegistrado.fecha)}
              />
            )}
            {resumen.ultimoInicioSesion && (
              <Tarjeta
                etiqueta="Última sesión iniciada"
                valor={formatearFecha(resumen.ultimoInicioSesion.fecha)}
                detalle={resumen.ultimoInicioSesion.nombre}
              />
            )}
            {resumen.ultimaActividad && (
              <Tarjeta
                etiqueta="Última vez que se usó la app"
                valor={formatearFecha(resumen.ultimaActividad.fecha)}
                detalle={`${resumen.ultimaActividad.nombre} — ${resumen.ultimaActividad.descripcion}`}
              />
            )}
          </div>
        </Seccion>

        <Seccion titulo="Altas por día">
          <ul className="flex items-end gap-1.5" style={{ height: '5rem' }}>
            {registrosPorDia.map(([dia, total]) => (
              <li key={dia} className="flex flex-1 flex-col items-center justify-end gap-1" title={`${dia}: ${total}`}>
                <span className="text-[0.65rem] font-semibold text-cocoa/70 dark:text-khaki/70">{total}</span>
                <div
                  className="w-full rounded-t bg-camel"
                  style={{ height: `${(total / maxRegistros) * 100}%`, minHeight: '2px' }}
                />
                <span className="text-[0.6rem] text-cocoa/50 dark:text-khaki/50">{dia.slice(5)}</span>
              </li>
            ))}
          </ul>
        </Seccion>

        <Seccion titulo="Función más usada">
          <ul className="space-y-3">
            {usoPorFuncion.map((u) => (
              <li key={u.funcion}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-cocoa dark:text-khaki">{u.funcion}</span>
                  <span className="text-cocoa/70 dark:text-khaki/70">{u.total}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-linen dark:bg-espresso/60">
                  <div
                    className="h-2 rounded-full bg-camel"
                    style={{ width: `${(u.total / maxUso) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Seccion>

        <Seccion titulo="Usuarios más activos">
          {usuariosMasActivos.length === 0 ? (
            <p className="text-sm text-cocoa/70 dark:text-khaki/70">Todavía no hay actividad registrada.</p>
          ) : (
            <ul className="space-y-3">
              {usuariosMasActivos.map((u, i) => (
                <li key={u.usuarioId} className="flex items-center gap-3">
                  <span className="w-5 shrink-0 text-right text-xs font-bold text-camel">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="truncate font-medium text-cocoa dark:text-khaki">{u.nombre}</span>
                      <span className="shrink-0 text-cocoa/70 dark:text-khaki/70">{u.total} acciones</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-linen dark:bg-espresso/60">
                      <div
                        className="h-1.5 rounded-full bg-camel"
                        style={{ width: `${(u.total / maxActividad) * 100}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Seccion>

        <Seccion titulo="Actividad reciente">
          {actividadReciente.length === 0 ? (
            <p className="text-sm text-cocoa/70 dark:text-khaki/70">Todavía no hay actividad registrada.</p>
          ) : (
            <ul className="space-y-2">
              {actividadReciente.map((e, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-camel/30 bg-linen px-4 py-2.5 text-sm dark:border-khaki/10 dark:bg-espresso/50"
                >
                  <p className="text-cocoa dark:text-linen">
                    <span className="font-semibold">{e.nombreUsuario}</span> — {e.descripcion}
                  </p>
                  <p className="mt-0.5 text-xs text-cocoa/60 dark:text-khaki/60">
                    {e.nombreCasa} · {formatearFecha(e.fecha)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Seccion>
      </div>
    </main>
  );
}
