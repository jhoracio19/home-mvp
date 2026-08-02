'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { actualizarIdioma } from '@/app/[locale]/(app)/perfil/actions';
import { itemClase, iconoClase } from './menu-clases';

// Cambia de idioma manteniendo la misma página y los mismos query
// params (ej. ?error=... no se pierde al cambiar de es a en). El
// locale elegido queda guardado en la cookie NEXT_LOCALE (así que
// persiste entre visitas sin depender de detección automática) y,
// si hay sesión, también en perfiles.idioma — eso es lo que usan las
// notificaciones push para saber en qué idioma escribirle a cada
// quien, ya que se mandan desde el servidor sin cookie de por medio.
export function LocaleSwitcher({ variant = 'compact' }: { variant?: 'compact' | 'menuItem' }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('LocaleSwitcher');

  const otroLocale: Locale = locale === 'es' ? 'en' : 'es';
  const query = searchParams.toString();
  const href = query ? `${pathname}?${query}` : pathname;
  const etiqueta = otroLocale === 'en' ? t('cambiarA') : t('cambiarAEs');

  function cambiarIdioma() {
    // No se espera a propósito: si no hay sesión, actualizarIdioma()
    // no hace nada (ver su comentario); si la hay, el guardado en BD
    // no necesita bloquear la navegación — la cookie ya basta para
    // que la UI cambie de idioma al instante.
    void actualizarIdioma(otroLocale);
    router.replace(href, { locale: otroLocale });
  }

  if (variant === 'menuItem') {
    return (
      <button type="button" onClick={cambiarIdioma} className={`w-full text-left ${itemClase}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
        </svg>
        {etiqueta}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={cambiarIdioma}
      aria-label={etiqueta}
      className="text-xs font-bold uppercase tracking-wide text-cocoa/70 transition-colors hover:text-cocoa"
    >
      {otroLocale}
    </button>
  );
}
