import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

const nav = createNavigation(routing);

export const { Link, usePathname, useRouter, getPathname } = nav;

// El `redirect` de next-intl SÍ lanza (nunca retorna) en tiempo de
// ejecución, pero su tipo generado no queda como el literal `never` —
// eso rompía el narrowing de TypeScript en cascada en cualquier función
// que hiciera `if (!x) redirect(...); return x;` (ej. getSesion()).
// Esta envoltura con `never` explícito en la firma le devuelve a TS esa
// garantía.
export function redirect(...args: Parameters<typeof nav.redirect>): never {
  return nav.redirect(...args);
}
