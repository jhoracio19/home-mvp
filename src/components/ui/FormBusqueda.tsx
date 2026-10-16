'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTransition, type FormEvent, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from './Button';
import { Spinner } from './Spinner';

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
        {pendiente && <Spinner />}
        {pendiente ? t('buscando') : t('buscar')}
      </Button>
    </form>
  );
}
