import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

// Link "← Volver" estándar (antes copiado con su SVG en 6 páginas).
export function BotonVolver({
  href,
  children,
}: {
  href: ComponentProps<typeof Link>['href'];
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-semibold text-cocoa hover:underline dark:text-khaki"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-4 w-4"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
      {children}
    </Link>
  );
}
