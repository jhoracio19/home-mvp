import Link from 'next/link';
import { buttonClasses } from '@/components/ui/Button';
import { Logomark } from './Logomark';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-camel/30 bg-linen/90 px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] backdrop-blur sm:px-8">
      <Link href="/" className="flex items-center gap-2">
        <Logomark className="h-8 w-8 rounded-lg" />
        <span className="text-sm font-bold text-espresso">RemindHome</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/login" className="flex items-center gap-1.5 text-sm font-semibold text-cocoa hover:underline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          Iniciar sesión
        </Link>
        <Link href="/signup" className={buttonClasses('primary', 'min-h-9 gap-1.5 px-3 text-sm')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="16" y1="11" x2="22" y2="11" />
          </svg>
          Crear cuenta
        </Link>
      </div>
    </header>
  );
}
