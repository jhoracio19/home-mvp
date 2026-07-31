'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { mensajeErrorAuth } from '@/lib/auth/errors';

async function getOrigin() {
  return (await headers()).get('origin') ?? '';
}

// '/dashboard' es siempre un destino seguro (interno); cualquier otro
// valor debe empezar con '/' para evitar que un `next` manipulado nos
// mande a un dominio externo (open redirect).
function destinoSeguro(next: string | null): string {
  if (next && next.startsWith('/') && !next.startsWith('//')) return next;
  return '/dashboard';
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
  const nextParam = next !== '/dashboard' ? `&next=${encodeURIComponent(next)}` : '';

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

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
