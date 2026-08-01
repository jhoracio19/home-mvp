import Link from 'next/link';
import { Logomark } from './Logomark';

const enlaceClase = 'flex items-center justify-center gap-1.5 hover:underline sm:justify-start';
const iconoClase = 'h-3.5 w-3.5 shrink-0';

export function SiteFooter() {
  return (
    <footer className="border-t border-camel/40 bg-linen px-4 py-10 sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 sm:flex-row sm:justify-between">
        <div className="max-w-xs space-y-3 text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <Logomark className="h-7 w-7 rounded-md" />
            <span className="text-sm font-bold text-espresso">RemindHome</span>
          </div>
          <p className="text-sm text-cocoa/70">
            El refri y las tareas del hogar, organizados y sin que tengas que acordarte tú.
          </p>
        </div>

        <div className="flex justify-center gap-10 sm:justify-end">
          <div className="space-y-2 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-camel">Producto</p>
            <ul className="space-y-1.5 text-sm text-cocoa">
              <li>
                <Link href="/#refri" className={enlaceClase}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <line x1="5" y1="10" x2="19" y2="10" />
                    <line x1="8" y1="5" x2="8" y2="7" />
                    <line x1="8" y1="13" x2="8" y2="15" />
                  </svg>
                  Refri
                </Link>
              </li>
              <li>
                <Link href="/#tareas" className={enlaceClase}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <polyline points="8 12 11 15 16 9" />
                  </svg>
                  Tareas
                </Link>
              </li>
              <li>
                <Link href="/#avisos" className={enlaceClase}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  Avisos
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-camel">Cuenta</p>
            <ul className="space-y-1.5 text-sm text-cocoa">
              <li>
                <Link href="/login" className={enlaceClase}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link href="/signup" className={enlaceClase}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="16" y1="11" x2="22" y2="11" />
                  </svg>
                  Crear cuenta
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-5xl flex-col items-center gap-2 border-t border-camel/30 pt-4 text-xs text-cocoa/60 sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} RemindHome</span>
        <Link href="/privacidad" className="font-semibold text-cocoa/70 hover:underline">
          Aviso de privacidad
        </Link>
      </div>
    </footer>
  );
}
