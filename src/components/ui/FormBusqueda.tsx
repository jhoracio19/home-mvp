'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTransition, type FormEvent, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from './Button';

// Envuelve los campos de búsqueda/filtro (Input, Select, etc.) y hace la
// navegación por cliente con useTransition en vez de un submit normal —
// así podemos mostrar un spinner mientras Next vuelve a pedir la página
// con los nuevos searchParams, cosa que un <form method="get"> plano no
// permite (esa navegación la maneja el navegador sin que React se entere).
export function FormBusqueda({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pendiente, startTransition] = useTransition();
  const t = useTranslations('Common');

  function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const params = new URLSearchParams();
    for (const [clave, valor] of datos.entries()) {
      if (typeof valor === 'string' && valor.trim()) params.set(clave, valor);
    }
    const destino = params.toString() ? `${pathname}?${params}` : pathname;
    startTransition(() => {
      router.push(destino);
    });
  }

  return (
    <form onSubmit={manejarSubmit} className="flex flex-wrap items-end gap-3">
      {children}
      <Button type="submit" disabled={pendiente} className="gap-2">
        {pendiente && (
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2Z"
            />
          </svg>
        )}
        {pendiente ? t('buscando') : t('buscar')}
      </Button>
    </form>
  );
}
