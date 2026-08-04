'use client';

import { useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { logout } from '@/app/[locale]/auth/actions';
import { itemClase, iconoClase } from './menu-clases';

// Versión mínima de MenuUsuario para /admin: esta pantalla no tiene
// casa activa, notificaciones ni switcher de idioma — solo necesita
// una salida para volver a la app normal y para cerrar sesión.
export function MenuAdmin() {
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
        className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-lg border-2 border-camel bg-white text-left shadow-lg"
      >
        <Link href="/casas" className={itemClase}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Ver la app
        </Link>

        <div className="border-t border-khaki" />

        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-[#a8422e] hover:bg-khaki/30"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
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
