'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { itemClase, iconoClase } from '@/components/layout/menu-clases';

// <details>/<summary> nativo, mismo patrón accesible que MenuUsuario
// (el menú de la app ya logueada): sin estado de React para abrir/
// cerrar, solo el JS necesario para cerrarlo al hacer clic afuera o
// al elegir una opción. A propósito solo trae instalar, idioma y
// entrar/registrarse — no todas las secciones (esas ya están en el
// footer).
export function MenuLanding() {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const t = useTranslations('Landing');
  const tAuth = useTranslations('Auth');

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
    <details ref={detailsRef} className="group relative shrink-0 sm:hidden">
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
        <Link href="/#instalar" className={itemClase}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
            <rect x="3" y="4" width="18" height="14" rx="2" />
            <path d="M8 21h8" />
            <path d="M12 11v5" />
            <path d="m9.5 13.5 2.5 2.5 2.5-2.5" />
          </svg>
          {t('instalar.eyebrow')}
        </Link>

        <LocaleSwitcher variant="menuItem" />

        <div className="border-t border-khaki" />

        <Link href="/login" className={itemClase}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          {tAuth('iniciarSesion')}
        </Link>

        <Link href="/signup" className={itemClase}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="16" y1="11" x2="22" y2="11" />
          </svg>
          {tAuth('crearCuenta')}
        </Link>
      </div>
    </details>
  );
}
