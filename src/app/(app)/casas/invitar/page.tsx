import Link from 'next/link';
import {
  getCasaActivaOrRedirect,
  getMiembrosCasaActiva,
  getRolEnCasaActiva,
  getUsuarioActual,
} from '@/lib/casas/data';
import { nombreMiembro } from '@/lib/casas/nombre-miembro';
import { getSiteUrl } from '@/lib/site-url';
import { generarCodigoInvitacion, quitarMiembro } from '../actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CopyButton } from '@/components/ui/CopyButton';

export default async function InvitarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [casa, rol, miembros, siteUrl, usuario, { error }] = await Promise.all([
    getCasaActivaOrRedirect(),
    getRolEnCasaActiva(),
    getMiembrosCasaActiva(),
    getSiteUrl(),
    getUsuarioActual(),
    searchParams,
  ]);

  const esAdmin = rol === 'admin';
  const codigoVigente =
    casa.codigo_invitacion && casa.codigo_invitacion_expira && new Date(casa.codigo_invitacion_expira) > new Date()
      ? casa.codigo_invitacion
      : null;
  const linkInvitacion = codigoVigente ? `${siteUrl}/casas/unirse?codigo=${codigoVigente}` : '';

  return (
    <main className="flex flex-1 justify-center bg-[radial-gradient(circle_at_top_left,_rgba(178,150,125,0.3),_transparent_34%)] bg-linen px-4 py-8 dark:bg-none dark:bg-espresso">
      <div className="h-fit w-full max-w-sm space-y-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-cocoa hover:underline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver
        </Link>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">{casa.nombre}</p>
          <h1 className="mt-1 text-xl font-bold text-cocoa dark:text-linen">Invitar miembros</h1>
        </div>

        {error && (
          <p className="rounded-lg border border-[#a8422e] bg-[#a8422e]/10 px-3 py-2 text-sm font-medium text-[#a8422e] dark:text-[#e3a999]">
            {error}
          </p>
        )}

        <div className="space-y-4 rounded-lg border border-camel bg-khaki p-6 shadow-lg dark:border-cocoa dark:bg-[#3a2820]">
          {!esAdmin ? (
            <p className="text-sm font-medium text-cocoa dark:text-khaki">
              Solo un admin de la casa puede generar o compartir el código de invitación.
            </p>
          ) : codigoVigente ? (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cocoa/70 dark:text-khaki/70">
                  Código actual
                </p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="font-mono text-3xl font-bold tracking-[0.2em] text-espresso dark:text-linen">
                    {codigoVigente}
                  </p>
                  <CopyButton texto={codigoVigente} />
                </div>
                <p className="mt-3 text-xs text-cocoa dark:text-khaki">
                  Válido hasta {new Date(casa.codigo_invitacion_expira!).toLocaleDateString('es-MX')}. O comparte
                  este link:
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate rounded-lg bg-linen px-2 py-1.5 text-xs text-cocoa dark:bg-black/20 dark:text-linen">
                    {linkInvitacion}
                  </p>
                  <CopyButton texto={linkInvitacion} className="shrink-0" />
                </div>
              </div>
              <form action={generarCodigoInvitacion}>
                <SubmitButton variant="secondary" className="w-full" pendingText="Generando…">
                  Generar código nuevo
                </SubmitButton>
              </form>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-cocoa dark:text-khaki">
                Aún no tienes un código de invitación activo (o ya expiró).
              </p>
              <form action={generarCodigoInvitacion}>
                <SubmitButton className="w-full" pendingText="Generando…">
                  Generar código de invitación
                </SubmitButton>
              </form>
            </>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-cocoa dark:text-linen">
            Miembros actuales ({miembros.length})
          </h2>
          <ul className="space-y-2">
            {miembros.map((m) => {
              const esUnoMismo = m.usuario_id === usuario.id;
              return (
                <li
                  key={m.usuario_id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-camel bg-khaki px-3 py-2 text-sm shadow-sm dark:border-cocoa dark:bg-[#3a2820]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-cocoa dark:text-linen">
                      {nombreMiembro(m)}
                      {esUnoMismo && <span className="text-cocoa/60"> (tú)</span>}
                    </p>
                    {m.nombre && <p className="truncate text-xs text-cocoa/70 dark:text-khaki/70">{m.email}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-cocoa dark:text-camel">
                      {m.rol}
                    </span>
                    {esAdmin && !esUnoMismo && (
                      <form action={quitarMiembro.bind(null, m.usuario_id)}>
                        <SubmitButton
                          variant="secondary"
                          className="min-h-0 px-2 py-1 text-xs"
                          pendingText="Quitando…"
                          confirmMessage={`¿Quitar a ${nombreMiembro(m)} de esta casa?`}
                        >
                          Quitar
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </main>
  );
}
