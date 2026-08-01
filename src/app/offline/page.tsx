import Link from 'next/link';
import { buttonClasses } from '@/components/ui/Button';

// Página estática de respaldo: el service worker (public/sw.js) la
// sirve cuando falla una navegación por falta de red. No debe depender
// de sesión, datos, ni ninguna llamada al servidor — tiene que poder
// salir completa desde la caché sin internet.
export default function OfflinePage() {
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
      <h1 className="text-xl font-bold text-espresso">Sin conexión</h1>
      <p className="max-w-xs text-sm text-cocoa">
        No hay internet en este momento. Cuando vuelvas a tener señal, intenta de nuevo.
      </p>
      <Link href="/" className={buttonClasses('primary')}>
        Reintentar
      </Link>
    </main>
  );
}
