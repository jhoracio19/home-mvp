import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { buttonClasses } from '@/components/ui/Button';

// Página de respaldo: el service worker (public/sw.js) la precachea
// (fetch real durante install, mientras hay conexión) y la sirve
// cuando falla una navegación por falta de red. No depende de sesión
// ni de ninguna llamada a datos — solo de next-intl, así que el HTML
// que quedó en caché sigue sirviendo completo sin internet.
export default async function OfflinePage() {
  const t = await getTranslations('Offline');
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-linen px-4 text-center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-camel">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
      <h1 className="text-xl font-bold text-espresso">{t('titulo')}</h1>
      <p className="max-w-xs text-sm text-cocoa">{t('descripcion')}</p>
      <Link href="/" className={buttonClasses('primary')}>
        {t('reintentar')}
      </Link>
    </main>
  );
}
