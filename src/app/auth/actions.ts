'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { mensajeErrorAuth } from '@/lib/auth/errors';

async function getOrigin() {
  return (await headers()).get('origin') ?? '';
}

// '/casas' (elegir casa) es el destino por defecto tras iniciar sesión —
// nunca auto-entra a una casa específica. Cualquier `next` explícito debe
// empezar con '/' para evitar que nos manden a un dominio externo.
function destinoSeguro(next: string | null): string {
  if (next && next.startsWith('/') && !next.startsWith('//')) return next;
  return '/casas';
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

  redirect(`/login?message=${encodeURIComponent('Revisa tu correo para confirmar tu cuenta.')}${nextParam}`);
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
    `/login?message=${encodeURIComponent('Si ese correo tiene una cuenta, te enviamos un link para restablecer tu contraseña.')}`
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
  redirect('/login');
}
