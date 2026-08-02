import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  // Rutas siempre explícitas (/es/tareas, /en/tareas) — evita ambigüedad
  // con el service worker (offline fallback) y el manifest de la PWA.
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
