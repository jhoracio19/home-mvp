'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard', label: 'Refri', match: (p: string) => p === '/dashboard' || p.startsWith('/refri') },
  { href: '/tareas', label: 'Tareas', match: (p: string) => p.startsWith('/tareas') },
];

const RUTAS_CON_NAV = ['/dashboard', '/refri', '/tareas'];

export function BottomNav() {
  const pathname = usePathname();

  // Fuera de una casa (ej. eligiendo/cambiando casa, invitando) el nav
  // de Refri/Tareas no aplica — mostrarlo ahí confunde más que ayuda.
  if (!RUTAS_CON_NAV.some((ruta) => pathname.startsWith(ruta))) return null;

  return (
    <nav className="sticky bottom-0 z-10 flex border-t border-camel bg-linen/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-cocoa dark:bg-espresso/95">
      {TABS.map((tab) => {
        const activo = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 border-t-2 py-3 text-center text-sm font-semibold transition-colors ${
              activo
                ? 'border-espresso text-espresso dark:border-linen dark:text-linen'
                : 'border-transparent text-cocoa/60 dark:text-khaki/60'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
