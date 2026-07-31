'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { logout } from '@/app/auth/actions';

// <details>/<summary> nativo para el desplegable en sí (accesible,
// sin estado de React); el único JS real aquí es cerrarlo al hacer
// clic afuera o al elegir una opción, que <details> no trae de fábrica.
export function MenuUsuario({ dentroDeCasa }: { dentroDeCasa: boolean }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function cerrarSiEsClicFuera(evento: MouseEvent) {
      const el = detailsRef.current;
      if (el && el.open && !el.contains(evento.target as Node)) {
        el.open = false;
      }
    }
    document.addEventListener('click', cerrarSiEsClicFuera);
    return () => document.removeEventListener('click', cerrarSiEsClicFuera);
  }, []);

  function cerrar() {
    if (detailsRef.current) detailsRef.current.open = false;
  }

  return (
    <details ref={detailsRef} className="group relative shrink-0">
      <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border-2 border-camel text-camel transition-colors hover:bg-camel hover:text-espresso [&::-webkit-details-marker]:hidden">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </summary>

      <div
        onClick={cerrar}
        className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border-2 border-khaki bg-white text-left shadow-lg dark:border-cocoa dark:bg-[#3a2820]"
      >
        {dentroDeCasa && (
          <>
            <Link
              href="/casas/invitar"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-espresso hover:bg-khaki/30 dark:text-linen dark:hover:bg-cocoa/40"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="16" y1="11" x2="22" y2="11" />
              </svg>
              Invitar miembros
            </Link>
            <Link
              href="/casas"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-espresso hover:bg-khaki/30 dark:text-linen dark:hover:bg-cocoa/40"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
              Cambiar casa
            </Link>
            <div className="border-t border-khaki dark:border-cocoa" />
          </>
        )}

        <a
          href="https://paypal.me/jhoracio19"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-cocoa hover:bg-khaki/30 dark:text-camel dark:hover:bg-cocoa/40"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4Z" />
            <line x1="6" y1="1" x2="6" y2="4" />
            <line x1="10" y1="1" x2="10" y2="4" />
            <line x1="14" y1="1" x2="14" y2="4" />
          </svg>
          Invítame un café
        </a>

        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-[#a8422e] hover:bg-khaki/30 dark:hover:bg-cocoa/40"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </form>
      </div>
    </details>
  );
}
