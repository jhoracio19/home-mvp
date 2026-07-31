import Link from 'next/link';
import { getCasasDelUsuario } from '@/lib/casas/data';
import { crearCasa, seleccionarCasa } from './actions';
import { Input } from '@/components/ui/Input';
import { SubmitButton } from '@/components/ui/SubmitButton';

export default async function CasasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const [casas, { error, message }] = await Promise.all([getCasasDelUsuario(), searchParams]);
  const totalCasas = casas.length;

  return (
    <main className="flex flex-1 bg-[radial-gradient(circle_at_top_left,_rgba(178,150,125,0.3),_transparent_34%)] bg-linen px-4 py-8 dark:bg-none dark:bg-espresso">
      <section className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">Espacios</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-cocoa dark:text-linen">Tus casas</h1>
                <p className="max-w-xl text-sm leading-6 text-cocoa dark:text-khaki">
                  Selecciona el hogar donde vas a gestionar el refri y las tareas compartidas.
                </p>
              </div>
              <div className="w-fit rounded-lg border border-camel bg-khaki px-3 py-2 text-sm font-semibold text-cocoa shadow-sm dark:border-cocoa dark:bg-[#3a2820] dark:text-linen">
                {totalCasas} {totalCasas === 1 ? 'casa' : 'casas'}
              </div>
            </div>
          </div>

          {message && (
            <p className="rounded-lg border-2 border-camel bg-khaki px-4 py-3 text-sm font-semibold text-cocoa">
              {message}
            </p>
          )}

          {error && (
            <p className="rounded-lg border border-[#fecdca] bg-[#fef3f2] px-4 py-3 text-sm font-semibold text-[#b42318] dark:border-[#7a271a] dark:bg-[#451a14] dark:text-[#fecdca]">
              {error}
            </p>
          )}

          {casas.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {casas.map((casa) => (
                <li key={casa.id}>
                  <form action={seleccionarCasa.bind(null, casa.id)}>
                    <button
                      type="submit"
                      className="group flex min-h-28 w-full flex-col justify-between rounded-lg border border-camel bg-khaki p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-espresso hover:shadow-md focus:outline-none focus:ring-2 focus:ring-camel/40 dark:border-cocoa dark:bg-[#3a2820] dark:hover:border-camel dark:hover:bg-cocoa"
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="text-lg font-bold text-cocoa dark:text-linen">
                          {casa.nombre}
                        </span>
                        <span
                          aria-hidden
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-camel text-lg font-semibold text-linen transition group-hover:bg-espresso dark:bg-cocoa dark:text-khaki dark:group-hover:bg-linen dark:group-hover:text-espresso"
                        >
                          →
                        </span>
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-cocoa/70 dark:text-khaki/70">
                        Abrir casa
                      </span>
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-camel bg-khaki/60 p-6 shadow-sm dark:border-khaki/40 dark:bg-[#3a2820]/80">
              <h2 className="text-lg font-bold text-cocoa dark:text-linen">Sin casas todavía</h2>
              <p className="mt-2 text-sm leading-6 text-cocoa dark:text-khaki">
                Crea tu primer hogar para empezar a organizar compras, caducidades y pendientes.
              </p>
            </div>
          )}
        </div>

        <aside className="h-fit rounded-lg border border-camel bg-khaki p-5 shadow-sm dark:border-cocoa dark:bg-[#3a2820]">
          <div className="mb-5 space-y-1">
            <h2 className="text-lg font-bold text-cocoa dark:text-linen">Nueva casa</h2>
            <p className="text-sm leading-6 text-cocoa dark:text-khaki">
              Usa un nombre fácil de reconocer para todos los miembros.
            </p>
          </div>
          <form action={crearCasa} className="space-y-4">
            <Input label="Nombre" name="nombre" placeholder="Ej. Departamento centro" required />
            <SubmitButton className="w-full" pendingText="Creando...">
              Crear casa
            </SubmitButton>
          </form>

          <div className="mt-5 border-t border-camel pt-5 text-center dark:border-cocoa">
            <p className="text-sm text-cocoa dark:text-khaki">¿Ya tienes un código de invitación?</p>
            <Link
              href="/casas/unirse"
              className="mt-1 inline-block text-sm font-bold text-camel hover:underline"
            >
              Unirme con un código
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
