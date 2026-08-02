import Link from 'next/link';
import { getCasaActivaOrRedirect } from '@/lib/casas/data';
import { getNotaCasa } from '@/lib/notas/data';
import { actualizarNotaCasa } from './actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { EscuchaRealtime } from '@/components/realtime/EscuchaRealtime';

const formatoFecha = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Mexico_City',
});

export default async function NotasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const [casa, nota, { error, message }] = await Promise.all([
    getCasaActivaOrRedirect(),
    getNotaCasa(),
    searchParams,
  ]);

  return (
    <main className="flex flex-1 justify-center bg-[radial-gradient(circle_at_top_left,_rgba(178,150,125,0.3),_transparent_34%)] bg-linen px-4 py-8">
      <EscuchaRealtime tabla="notas_casa" casaId={casa.id} />
      <section className="w-full max-w-2xl space-y-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-cocoa hover:underline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver
        </Link>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">{casa.nombre}</p>
          <h1 className="mt-1 text-2xl font-bold text-cocoa">Notas de la casa</h1>
          <p className="mt-1 text-sm text-cocoa/70">
            Wifi, reglas, contactos de emergencia — lo que todos en la casa necesiten tener a la mano. Cualquiera
            puede editarla.
          </p>
        </div>

        {message && (
          <p className="rounded-lg border-2 border-camel bg-linen px-3 py-2 text-sm font-semibold text-cocoa">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-lg border border-[#a8422e] bg-[#a8422e]/10 px-3 py-2 text-sm font-medium text-[#a8422e]">
            {error}
          </p>
        )}

        <form action={actualizarNotaCasa} className="space-y-3">
          <label htmlFor="contenido" className="sr-only">
            Notas de la casa
          </label>
          <textarea
            id="contenido"
            name="contenido"
            defaultValue={nota?.contenido ?? ''}
            maxLength={5000}
            rows={14}
            placeholder={'Ej.\nWifi: MiCasa2024 / Clave: ****\nNo fiestas después de las 11pm\nEmergencias: portero 555-123-4567'}
            className="w-full rounded-lg border-2 border-camel bg-khaki px-4 py-3 text-sm leading-relaxed text-cocoa shadow-sm placeholder:text-cocoa/50 focus:border-espresso focus:outline-none focus:ring-2 focus:ring-camel/35"
          />
          <div className="flex items-center justify-between gap-3">
            {nota?.actualizado_en ? (
              <p className="text-xs text-cocoa/60">
                Última actualización: {formatoFecha.format(new Date(nota.actualizado_en))}
              </p>
            ) : (
              <span />
            )}
            <SubmitButton pendingText="Guardando…">Guardar</SubmitButton>
          </div>
        </form>
      </section>
    </main>
  );
}
