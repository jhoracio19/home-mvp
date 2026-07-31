import Link from 'next/link';
import { getCasaActiva, getUsuarioActual } from '@/lib/casas/data';
import { getPerfilPropio } from '@/lib/perfil/data';
import { BottomNav } from '@/components/layout/BottomNav';
import { MenuUsuario } from '@/components/layout/MenuUsuario';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // getUsuarioActual redirige a /login si no hay sesión.
  const user = await getUsuarioActual();
  const [casaActiva, perfil] = await Promise.all([getCasaActiva(), getPerfilPropio()]);
  const saludo = perfil?.nombre ? `Hola, ${perfil.nombre}` : user.email;

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-espresso px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] shadow-md">
        <div className="min-w-0">
          <Link href="/dashboard" className="block truncate text-sm font-semibold text-linen hover:underline">
            {casaActiva ? casaActiva.nombre : 'Gestión doméstica'}
          </Link>
          <p className="truncate text-xs text-khaki">{saludo}</p>
        </div>
        <MenuUsuario dentroDeCasa={!!casaActiva} />
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
      {casaActiva && <BottomNav />}
    </div>
  );
}
