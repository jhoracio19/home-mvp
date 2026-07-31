'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { mensajeErrorAuth } from '@/lib/auth/errors';

async function getOrigin() {
  return (await headers()).get('origin') ?? '';
}

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(mensajeErrorAuth(error.message))}`);
  }

  redirect('/dashboard');
}

export async function signup(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (password !== confirmPassword) {
    redirect(`/signup?error=${encodeURIComponent('Las contraseñas no coinciden.')}`);
  }
  if (password.length < 8) {
    redirect(`/signup?error=${encodeURIComponent('La contraseña debe tener al menos 8 caracteres.')}`);
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(mensajeErrorAuth(error.message))}`);
  }

  redirect(`/login?message=${encodeURIComponent('Revisa tu correo para confirmar tu cuenta.')}`);
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/auth/callback` },
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
