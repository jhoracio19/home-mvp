import Link from 'next/link';
import { getCasaActivaOrRedirect, getRolEnCasaActiva } from '@/lib/casas/data';
import { renombrarCasa, eliminarCasa } from '../actions';
import { Input } from '@/components/ui/Input';
import { SubmitButton } from '@/components/ui/SubmitButton';

export default async function ConfiguracionCasaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const [casa, rol, { error, message }] = await Promise.all([
    getCasaActivaOrRedirect(),
    getRolEnCasaActiva(),
    searchParams,
  ]);

  const esAdmin = rol === 'admin';

  return (
    <main className="flex flex-1 justify-center bg-[radial-gradient(circle_at_top_left,_rgba(178,150,125,0.3),_transparent_34%)] bg-linen px-4 py-8">
      <div className="h-fit w-full max-w-sm space-y-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-cocoa hover:underline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver
        </Link>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">{casa.nombre}</p>
          <h1 className="mt-1 text-xl font-bold text-cocoa">Configuración de la casa</h1>
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

        {!esAdmin ? (
          <div className="space-y-4 rounded-lg border border-camel bg-khaki p-6 shadow-lg">
            <p className="text-sm font-medium text-cocoa">
              Solo un admin de la casa puede renombrarla o eliminarla.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 rounded-lg border border-camel bg-khaki p-6 shadow-lg">
              <h2 className="text-sm font-bold text-cocoa">Nombre de la casa</h2>
              <form action={renombrarCasa} className="space-y-3">
                <Input label="Nombre" name="nombre" defaultValue={casa.nombre} required />
                <SubmitButton className="w-full">Guardar cambios</SubmitButton>
              </form>
            </div>

            <div className="space-y-3 rounded-lg border-2 border-[#a8422e]/40 bg-[#a8422e]/5 p-6 shadow-lg">
              <h2 className="text-sm font-bold text-[#a8422e]">Zona de peligro</h2>
              <p className="text-sm text-cocoa">
                Elimina esta casa junto con todos sus miembros, lo que haya en el refri y las tareas. No se
                puede deshacer.
              </p>
              <form action={eliminarCasa}>
                <SubmitButton
                  variant="danger"
                  className="w-full"
                  pendingText="Eliminando…"
                  confirmMessage={`¿Eliminar "${casa.nombre}" para siempre? Se borra todo: miembros, refri y tareas.`}
                >
                  Eliminar esta casa
                </SubmitButton>
              </form>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
