'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
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
        <Link href="/signup" className={buttonClasses('primary', 'w-full')}>
          {texto}
        </Link>
      </div>
    </>
  );
}
