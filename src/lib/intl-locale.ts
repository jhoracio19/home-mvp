import type { Locale } from '@/i18n/routing';

// Mapea nuestro locale de ruta ('es' | 'en') al locale de verdad que
// esperan los Intl.* (nombres de mes, formatos de fecha, etc). La zona
// horaria se mantiene fija en America/Mexico_City sin importar el
// idioma — es una decisión de producto (todas las casas son de México
// por ahora), no de idioma de interfaz.
export function intlLocale(locale: Locale): string {
  return locale === 'en' ? 'en-US' : 'es-MX';
}
