import Link from 'next/link';
import { getCasaActiva, getUsuarioActual } from '@/lib/casas/data';
import { getPerfilPropio } from '@/lib/perfil/data';
import { logout } from '@/app/auth/actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { BottomNav } from '@/components/layout/BottomNav';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // getUsuarioActual redirige a /login si no hay sesión.
  const user = await getUsuarioActual();
  const [casaActiva, perfil] = await Promise.all([getCasaActiva(), getPerfilPropio()]);
  const saludo = perfil?.nombre ? `Hola, ${perfil.nombre}` : user.email;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-espresso px-4 py-3 shadow-md">
        <div className="min-w-0">
          <Link href="/dashboard" className="block truncate text-sm font-semibold text-linen hover:underline">
            {casaActiva ? casaActiva.nombre : 'Gestión doméstica'}
          </Link>
          <p className="truncate text-xs text-khaki">{saludo}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {casaActiva && (
            <Link
              href="/casas/invitar"
              className="text-xs font-semibold text-camel hover:text-linen hover:underline"
            >
              Invitar
            </Link>
          )}
          <Link
            href="/casas"
            className="text-xs font-semibold text-camel hover:text-linen hover:underline"
          >
            Cambiar casa
          </Link>
          <form action={logout}>
            <SubmitButton
              className="min-h-0 border-2 border-camel px-2 py-1 text-xs text-camel hover:bg-camel hover:text-espresso"
              variant="secondary"
              pendingText="Saliendo…"
            >
              Salir
            </SubmitButton>
          </form>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
      {casaActiva && <BottomNav />}
    </div>
  );
}
