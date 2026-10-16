'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

// Los cinco módulos viven en el nav (antes Gastos y Notas solo eran
// alcanzables desde el menú hamburguesa, y al entrar el nav desaparecía).
const RUTAS_CON_NAV = ['/dashboard', '/refri', '/compras', '/tareas', '/gastos', '/notas'];

function Icono({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mx-auto mb-0.5 h-5 w-5"
    >
      {children}
    </svg>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations('Nav');

  const TABS = [
    {
      href: '/dashboard',
      label: t('refri'),
      match: (p: string) => p === '/dashboard' || p.startsWith('/refri'),
      icono: (
        <Icono>
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="5" y1="10" x2="19" y2="10" />
          <line x1="9" y1="5" x2="9" y2="7" />
          <line x1="9" y1="13" x2="9" y2="16" />
        </Icono>
      ),
    },
    {
      href: '/compras',
      label: t('compras'),
      match: (p: string) => p.startsWith('/compras'),
      icono: (
        <Icono>
          <path d="M6 6h15l-1.5 9h-12z" />
          <path d="M6 6 5 3H2" />
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="18" cy="20" r="1.5" />
        </Icono>
      ),
    },
    {
      href: '/tareas',
      label: t('tareas'),
      match: (p: string) => p.startsWith('/tareas'),
      icono: (
        <Icono>
          <path d="M9 11l3 3 8-8" />
          <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
        </Icono>
      ),
    },
    {
      href: '/gastos',
      label: t('gastos'),
      match: (p: string) => p.startsWith('/gastos'),
      icono: (
        <Icono>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10" />
          <path d="M15 9.5c0-1.1-1.34-2-3-2s-3 .9-3 2 1.34 2 3 2 3 .9 3 2-1.34 2-3 2-3-.9-3-2" />
        </Icono>
      ),
    },
    {
      href: '/notas',
      label: t('notas'),
      match: (p: string) => p.startsWith('/notas'),
      icono: (
        <Icono>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="13" y2="17" />
        </Icono>
      ),
    },
  ];

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
            aria-current={activo ? 'page' : undefined}
            className={`flex-1 border-t-2 py-2 text-center text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-camel ${
              activo
                ? 'border-espresso text-espresso dark:border-linen dark:text-linen'
                : 'border-transparent text-cocoa/60 dark:text-khaki/60'
            }`}
          >
            {tab.icono}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
