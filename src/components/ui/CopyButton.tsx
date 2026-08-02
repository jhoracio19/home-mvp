'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function CopyButton({ texto, className = '' }: { texto: string; className?: string }) {
  const [copiado, setCopiado] = useState(false);
  const t = useTranslations('Common');

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Clipboard API puede fallar sin HTTPS o sin permiso; no rompe la UI.
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className={`rounded-lg border-2 border-cocoa px-3 py-1.5 text-xs font-semibold text-cocoa transition-colors hover:bg-camel hover:text-linen dark:border-camel dark:text-camel dark:hover:bg-camel dark:hover:text-espresso ${className}`}
    >
      {copiado ? t('copiado') : t('copiar')}
    </button>
  );
}
