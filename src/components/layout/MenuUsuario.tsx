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
              className="block px-4 py-3 text-sm font-medium text-espresso hover:bg-khaki/30 dark:text-linen dark:hover:bg-cocoa/40"
            >
              Invitar miembros
            </Link>
            <Link
              href="/casas"
              className="block px-4 py-3 text-sm font-medium text-espresso hover:bg-khaki/30 dark:text-linen dark:hover:bg-cocoa/40"
            >
              Salir de esta casa
            </Link>
            <div className="border-t border-khaki dark:border-cocoa" />
          </>
        )}

        <a
          href="https://paypal.me/jhoracio19"
          target="_blank"
          rel="noopener noreferrer"
          className="block px-4 py-3 text-sm font-medium text-cocoa hover:bg-khaki/30 dark:text-camel dark:hover:bg-cocoa/40"
        >
          ☕ Invítame un café
        </a>

        <form action={logout}>
          <button
            type="submit"
            className="block w-full px-4 py-3 text-left text-sm font-semibold text-[#a8422e] hover:bg-khaki/30 dark:hover:bg-cocoa/40"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </details>
  );
}
