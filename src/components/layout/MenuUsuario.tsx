'use client';

import { useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { logout } from '@/app/auth/actions';
import { salirDeCasa } from '@/app/(app)/casas/actions';
import { NotificacionesToggle } from '@/components/notificaciones/NotificacionesToggle';
import { itemClase, iconoClase } from './menu-clases';

// <details>/<summary> nativo para el desplegable en sí (accesible,
// sin estado de React); el único JS real aquí es cerrarlo al hacer
// clic afuera o al elegir una opción, que <details> no trae de fábrica.
export function MenuUsuario({ dentroDeCasa, esAdmin }: { dentroDeCasa: boolean; esAdmin: boolean }) {
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

  function confirmarSalida(evento: FormEvent<HTMLFormElement>) {
    if (!window.confirm('¿Seguro que quieres salir de esta casa?')) {
      evento.preventDefault();
    }
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
        className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border-2 border-camel bg-white text-left shadow-lg"
      >
        {dentroDeCasa && (
          <>
            <Link href="/casas/invitar" className={itemClase}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="16" y1="11" x2="22" y2="11" />
              </svg>
              Invitar miembros
            </Link>
            <Link href="/notas" className={itemClase}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="13" y2="17" />
              </svg>
              Notas de la casa
            </Link>
            <Link href="/gastos" className={itemClase}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v10" />
                <path d="M15 9.5c0-1.1-1.34-2-3-2s-3 .9-3 2 1.34 2 3 2 3 .9 3 2-1.34 2-3 2-3-.9-3-2" />
              </svg>
              Gastos compartidos
            </Link>
            <Link href="/casas" className={itemClase}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
              Cambiar casa
            </Link>
            {esAdmin && (
              <Link href="/casas/configuracion" className={itemClase}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                </svg>
                Configuración de la casa
              </Link>
            )}
          </>
        )}

        <Link href="/perfil" className={itemClase}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
          </svg>
          Mi perfil
        </Link>

        <NotificacionesToggle />

        <div className="border-t border-khaki" />

        <a
          href="mailto:jhoracio19@hotmail.com?subject=Problema%20en%20Gesti%C3%B3n%20dom%C3%A9stica"
          className={itemClase}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
          Reportar un problema
        </a>

        <a
          href="https://paypal.me/jhoracio19"
          target="_blank"
          rel="noopener noreferrer"
          className={itemClase}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4Z" />
            <line x1="6" y1="1" x2="6" y2="4" />
            <line x1="10" y1="1" x2="10" y2="4" />
            <line x1="14" y1="1" x2="14" y2="4" />
          </svg>
          Buy me a coffee
        </a>

        <div className="border-t border-khaki" />

        {dentroDeCasa && (
          <form action={salirDeCasa} onSubmit={confirmarSalida}>
            <button type="submit" className={`w-full text-left ${itemClase}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
                <path d="M13 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
                <polyline points="9 8 5 12 9 16" />
                <line x1="5" y1="12" x2="17" y2="12" />
              </svg>
              Salir de esta casa
            </button>
          </form>
        )}

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
