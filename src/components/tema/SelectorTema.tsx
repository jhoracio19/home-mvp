'use client';

import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';

export type TemaId = 'arcilla' | 'petroleo' | 'cafe' | 'bosque' | 'ciruela' | 'oceano';

// Cada swatch muestra el par camel/cocoa del tema para que se
// distingan de un vistazo. 'arcilla' es el default (sin data-tema).
const TEMAS: { id: TemaId; camel: string; cocoa: string }[] = [
  { id: 'arcilla', camel: '#C08A66', cocoa: '#7C4A2D' },
  { id: 'petroleo', camel: '#7E9EA5', cocoa: '#24454C' },
  { id: 'cafe', camel: '#B2967D', cocoa: '#6E4E3A' },
  { id: 'bosque', camel: '#8CAB80', cocoa: '#3C5E34' },
  { id: 'ciruela', camel: '#AC84A6', cocoa: '#5D3A5A' },
  { id: 'oceano', camel: '#7E9FBC', cocoa: '#2E4E68' },
];

function aplicarTema(id: TemaId) {
  if (id === 'arcilla') {
    delete document.documentElement.dataset.tema;
  } else {
    document.documentElement.dataset.tema = id;
  }
  // Cookie de un año; el layout la aplica antes del primer pintado.
  document.cookie = `tema=${id}; path=/; max-age=31536000; samesite=lax`;
}

// El tema activo se lee del DOM vía useSyncExternalStore: en el server
// no hay tema (null, nada resaltado) y en el cliente se lee el atributo
// real tras hidratar, sin riesgo de desajuste.
function suscribirTema(callback: () => void) {
  window.addEventListener('temacambiado', callback);
  return () => window.removeEventListener('temacambiado', callback);
}

// Selector del color de la casa. El tema vive en una cookie por
// dispositivo: cambia toda la paleta (tokens CSS) al instante, sin
// recargar y sin tocar la base de datos.
export function SelectorTema({ variant = 'menu' }: { variant?: 'menu' | 'landing' }) {
  const t = useTranslations('Tema');
  const activo = useSyncExternalStore<TemaId | null>(
    suscribirTema,
    () => (document.documentElement.dataset.tema as TemaId) ?? 'arcilla',
    () => null,
  );

  function elegir(id: TemaId) {
    aplicarTema(id);
    window.dispatchEvent(new Event('temacambiado'));
  }

  const tamano = variant === 'landing' ? 'h-8 w-8' : 'h-6 w-6';

  return (
    <div className={variant === 'landing' ? 'space-y-2' : 'px-4 py-3'}>
      <p
        className={
          variant === 'landing'
            ? 'text-sm font-semibold text-cocoa'
            : 'text-xs font-semibold uppercase tracking-wide text-cocoa/70'
        }
      >
        {variant === 'landing' ? t('landingTitulo') : t('titulo')}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {TEMAS.map((tema) => (
          <button
            key={tema.id}
            type="button"
            onClick={() => elegir(tema.id)}
            aria-pressed={activo === tema.id}
            aria-label={t(tema.id)}
            title={t(tema.id)}
            className={`${tamano} rounded-full border transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel focus-visible:ring-offset-2 focus-visible:ring-offset-linen ${
              activo === tema.id
                ? 'scale-110 border-espresso ring-2 ring-espresso/40 ring-offset-1 ring-offset-linen'
                : 'border-overlay/70 hover:scale-105'
            }`}
            style={{ background: `linear-gradient(135deg, ${tema.camel} 50%, ${tema.cocoa} 50%)` }}
          />
        ))}
      </div>
    </div>
  );
}
