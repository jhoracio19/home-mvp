'use server';

import { redirect as redirectExterno } from 'next/navigation';
import { headers } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { mensajeErrorAuth } from '@/lib/auth/errors';
import { destinoSeguro } from '@/lib/auth/destino-seguro';
import { esAdmin } from '@/lib/admin/auth';
import { redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

async function getOrigin() {
  return (await headers()).get('origin') ?? '';
}

// Confirma el link de correo (registro o recuperación) SOLO cuando la
// persona da clic al botón en /auth/confirmar — no antes. Si en vez de
// eso verificáramos apenas alguien visita el link (GET), un escáner de
// seguridad de correo (Outlook Safe Links, antivirus corporativos, etc.)
// que abre el link solo, sin que nadie lo vea, "gastaría" el código de
// un solo uso antes de que la persona real le dé clic — eso es
// justamente lo que le pasó a las hermanas del usuario: a ellas les
// salía "expiró" pero la cuenta ya había quedado confirmada por el
// escáner. Con el botón, el GET inicial solo pinta la página; el POST
// del formulario es lo único que de verdad llama a verifyOtp.
export async function confirmarCuenta(formData: FormData) {
  const t = await getTranslations('Auth');
  const locale = (await getLocale()) as Locale;
  const tokenHash = String(formData.get('token_hash') ?? '');
  const type = String(formData.get('type') ?? '') as EmailOtpType;
  const next = destinoSeguro(String(formData.get('next') ?? ''));

  if (!tokenHash || !type) {
    redirect({ href: `/auth/confirmar?error=${encodeURIComponent(t('linkInvalido'))}`, locale });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

  if (error) {
    const mensaje = type === 'recovery' ? t('recoveryExpirado') : t('signupExpirado');
    redirect({ href: `/login?error=${encodeURIComponent(mensaje)}`, locale });
  }

  redirect({ href: next, locale });
}

export async function login(formData: FormData) {
  const locale = (await getLocale()) as Locale;
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = destinoSeguro(String(formData.get('next') ?? ''));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect({
      href: `/login?error=${encodeURIComponent(mensajeErrorAuth(error.message, locale))}&next=${encodeURIComponent(next)}`,
      locale,
    });
  }

  // La cuenta de superusuario siempre entra directo al panel de
  // actividad (/admin), sin importar a dónde apuntara `next` — ese
  // correo es solo para ver esos datos, no para usar la app normal.
  redirect({ href: esAdmin(data.user?.email) ? '/admin' : next, locale });
}

export async function signup(formData: FormData) {
  const t = await getTranslations('Auth');
  const locale = (await getLocale()) as Locale;
  const nombre = String(formData.get('nombre') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');
  const next = destinoSeguro(String(formData.get('next') ?? ''));
  const nextParam = next !== '/casas' ? `&next=${encodeURIComponent(next)}` : '';

  if (!nombre) {
    redirect({ href: `/signup?error=${encodeURIComponent(t('nicknameObligatorio'))}${nextParam}`, locale });
  }
  if (nombre.length > 60) {
    redirect({ href: `/signup?error=${encodeURIComponent(t('nicknameLargo'))}${nextParam}`, locale });
  }
  if (password !== confirmPassword) {
    redirect({ href: `/signup?error=${encodeURIComponent(t('passwordsNoCoinciden'))}${nextParam}`, locale });
  }
  if (password.length < 8) {
    redirect({ href: `/signup?error=${encodeURIComponent(t('passwordCorta'))}${nextParam}`, locale });
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Llega a raw_user_meta_data; el trigger trg_nuevo_usuario
      // (schema.sql) los copia a la tabla `perfiles` automáticamente.
      // `apellido` ya no se pide aquí a propósito (ver nombreMiembro());
      // solo llega para altas por Google, que sí manda family_name solo.
      // idioma = el locale desde el que se registró, para que las
      // notificaciones push le lleguen en su idioma desde el día uno
      // sin que tenga que tocar el switch de idioma primero.
      data: { nombre, idioma: locale },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirect({ href: `/signup?error=${encodeURIComponent(mensajeErrorAuth(error.message, locale))}${nextParam}`, locale });
  }

  redirect({ href: `/login?message=${encodeURIComponent(t('revisaCorreo'))}${nextParam}`, locale });
}

export async function signInWithGoogle(formData: FormData) {
  const t = await getTranslations('Auth');
  const locale = (await getLocale()) as Locale;
  const next = destinoSeguro(String(formData.get('next') ?? ''));
  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });

  if (error || !data.url) {
    redirect({ href: `/login?error=${encodeURIComponent(t('errorGoogle'))}`, locale });
  }

  // URL externa (accounts.google.com) — el redirect de next-intl solo
  // sabe manejar rutas internas de la app, así que aquí sí usamos el
  // redirect "crudo" de Next.
  redirectExterno(data.url);
}

export async function solicitarRecuperacion(formData: FormData) {
  const t = await getTranslations('Auth');
  const locale = (await getLocale()) as Locale;
  const email = String(formData.get('email') ?? '').trim();
  if (!email) {
    redirect({ href: `/recuperar?error=${encodeURIComponent(t('escribeCorreo'))}`, locale });
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  // No revisamos el resultado ni distinguimos "correo no existe" del
  // éxito real: mostrar siempre el mismo mensaje evita que alguien use
  // este formulario para adivinar qué correos tienen cuenta.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/restablecer')}`,
  });

  redirect({ href: `/login?message=${encodeURIComponent(t('siExisteCuenta'))}`, locale });
}

export async function actualizarContrasena(formData: FormData) {
  const t = await getTranslations('Auth');
  const locale = (await getLocale()) as Locale;
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (password !== confirmPassword) {
    redirect({ href: `/restablecer?error=${encodeURIComponent(t('passwordsNoCoinciden'))}`, locale });
  }
  if (password.length < 8) {
    redirect({ href: `/restablecer?error=${encodeURIComponent(t('passwordCorta'))}`, locale });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect({ href: `/restablecer?error=${encodeURIComponent(mensajeErrorAuth(error.message, locale))}`, locale });
  }

  redirect({ href: `/casas?message=${encodeURIComponent(t('contrasenaActualizada'))}`, locale });
}

export async function logout() {
  const locale = (await getLocale()) as Locale;
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect({ href: '/', locale });
}
