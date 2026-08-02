'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { mensajeErrorAuth } from '@/lib/auth/errors';
import { destinoSeguro } from '@/lib/auth/destino-seguro';

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
  const tokenHash = String(formData.get('token_hash') ?? '');
  const type = String(formData.get('type') ?? '') as EmailOtpType;
  const next = destinoSeguro(String(formData.get('next') ?? ''));

  if (!tokenHash || !type) {
    redirect(`/auth/confirmar?error=${encodeURIComponent('Este link no es válido.')}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

  if (error) {
    const mensaje =
      type === 'recovery'
        ? 'Tu link para restablecer la contraseña ya no es válido. Pide uno nuevo.'
        : 'Tu link ya no es válido. Si ya te habías registrado antes, intenta iniciar sesión directamente.';
    redirect(`/login?error=${encodeURIComponent(mensaje)}`);
  }

  redirect(next);
}

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = destinoSeguro(String(formData.get('next') ?? ''));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(mensajeErrorAuth(error.message))}&next=${encodeURIComponent(next)}`
    );
  }

  redirect(next);
}

export async function signup(formData: FormData) {
  const nombre = String(formData.get('nombre') ?? '').trim();
  const apellido = String(formData.get('apellido') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');
  const next = destinoSeguro(String(formData.get('next') ?? ''));
  const nextParam = next !== '/casas' ? `&next=${encodeURIComponent(next)}` : '';

  if (!nombre || !apellido) {
    redirect(`/signup?error=${encodeURIComponent('Nombre y apellido son obligatorios.')}${nextParam}`);
  }
  if (nombre.length > 60 || apellido.length > 60) {
    redirect(`/signup?error=${encodeURIComponent('Nombre y apellido no pueden pasar de 60 caracteres.')}${nextParam}`);
  }
  if (password !== confirmPassword) {
    redirect(`/signup?error=${encodeURIComponent('Las contraseñas no coinciden.')}${nextParam}`);
  }
  if (password.length < 8) {
    redirect(`/signup?error=${encodeURIComponent('La contraseña debe tener al menos 8 caracteres.')}${nextParam}`);
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Llega a raw_user_meta_data; el trigger trg_nuevo_usuario
      // (schema.sql) los copia a la tabla `perfiles` automáticamente.
      data: { nombre, apellido },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(mensajeErrorAuth(error.message))}${nextParam}`);
  }

  redirect(
    `/login?message=${encodeURIComponent('Revisa tu correo para confirmar tu cuenta — si no lo ves en unos minutos, checa spam o promociones.')}${nextParam}`
  );
}

export async function signInWithGoogle(formData: FormData) {
  const next = destinoSeguro(String(formData.get('next') ?? ''));
  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });

  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent('No se pudo iniciar sesión con Google.')}`);
  }

  redirect(data.url);
}

export async function solicitarRecuperacion(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  if (!email) {
    redirect(`/recuperar?error=${encodeURIComponent('Escribe tu correo.')}`);
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  // No revisamos el resultado ni distinguimos "correo no existe" del
  // éxito real: mostrar siempre el mismo mensaje evita que alguien use
  // este formulario para adivinar qué correos tienen cuenta.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/restablecer')}`,
  });

  redirect(
    `/login?message=${encodeURIComponent(
      'Si ese correo tiene una cuenta, te enviamos un link para restablecer tu contraseña — si no lo ves en unos minutos, checa spam o promociones.'
    )}`
  );
}

export async function actualizarContrasena(formData: FormData) {
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (password !== confirmPassword) {
    redirect(`/restablecer?error=${encodeURIComponent('Las contraseñas no coinciden.')}`);
  }
  if (password.length < 8) {
    redirect(`/restablecer?error=${encodeURIComponent('La contraseña debe tener al menos 8 caracteres.')}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/restablecer?error=${encodeURIComponent(mensajeErrorAuth(error.message))}`);
  }

  redirect(`/casas?message=${encodeURIComponent('Tu contraseña se actualizó correctamente.')}`);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
