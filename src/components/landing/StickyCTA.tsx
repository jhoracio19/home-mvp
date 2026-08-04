'use client';

import { useEffect, useRef, useState } from 'react';
import { signInWithGoogle } from '@/app/[locale]/auth/actions';
import { buttonClasses } from '@/components/ui/Button';

// Barra fija solo en móvil (donde vive el 73% del tráfico): aparece en
// cuanto el CTA del hero sale de vista, para no obligar a alguien que
// ya se convenció a medio scroll a volver hasta arriba o bajar hasta
// el final. El <div> vacío es el "sentinela" que IntersectionObserver
// vigila — cuando deja de verse, el CTA fijo entra.
export function StickyCTA({ texto }: { texto: string }) {
  const [visible, setVisible] = useState(false);
  const sentinelaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelaRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entrada]) => setVisible(!entrada.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelaRef} aria-hidden className="h-px w-full" />
      <div
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-camel/40 bg-linen/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-4px_16px_rgba(74,52,42,0.12)] backdrop-blur transition-transform duration-300 sm:hidden ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <form action={signInWithGoogle}>
          <button type="submit" className={buttonClasses('primary', 'w-full gap-2')}>
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
              <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.8Z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.1C3.25 21.3 7.31 24 12 24Z" />
              <path fill="#FBBC05" d="M5.29 14.29A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.57.38-2.29v-3.1H1.28A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l4.01-3.1Z" />
              <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.61l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77Z" />
            </svg>
            {texto}
          </button>
        </form>
      </div>
    </>
  );
}
