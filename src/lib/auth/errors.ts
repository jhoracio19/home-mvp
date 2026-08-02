import type { Locale } from '@/i18n/routing';

// Mensajes técnicos que devuelve Supabase (siempre en inglés) traducidos
// a algo legible — no pasan por next-intl porque son un mapeo fijo por
// texto exacto, no contenido editorial.
const MENSAJES: Record<Locale, Record<string, string>> = {
  es: {
    'Invalid login credentials': 'Correo o contraseña incorrectos.',
    'User already registered': 'Ya existe una cuenta con ese correo.',
    'Email not confirmed': 'Confirma tu correo antes de iniciar sesión.',
    'Password should be at least 6 characters.': 'La contraseña debe tener al menos 6 caracteres.',
  },
  en: {
    'Invalid login credentials': 'Incorrect email or password.',
    'User already registered': 'An account with that email already exists.',
    'Email not confirmed': 'Confirm your email before signing in.',
    'Password should be at least 6 characters.': 'Password must be at least 6 characters.',
  },
};

export function mensajeErrorAuth(message: string, locale: Locale): string {
  return MENSAJES[locale][message] ?? message;
}
