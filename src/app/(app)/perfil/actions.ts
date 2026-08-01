'use server';

import { redirect } from 'next/navigation';
import { getSesion } from '@/lib/casas/data';

export async function actualizarPerfil(formData: FormData) {
  const nombre = String(formData.get('nombre') ?? '').trim();
  const apellido = String(formData.get('apellido') ?? '').trim();

  if (!nombre || !apellido) {
    redirect(`/perfil?error=${encodeURIComponent('Nombre y apellido son obligatorios.')}`);
  }
  if (nombre.length > 60 || apellido.length > 60) {
    redirect(`/perfil?error=${encodeURIComponent('Nombre y apellido no pueden pasar de 60 caracteres.')}`);
  }

  const { supabase, user } = await getSesion();

  // upsert (no update): así también funciona para cuentas viejas que se
  // crearon antes de que existiera el trigger que llena `perfiles` solo.
  const { error } = await supabase
    .from('perfiles')
    .upsert({ id: user.id, nombre, apellido }, { onConflict: 'id' });

  if (error) {
    redirect(`/perfil?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/perfil?message=${encodeURIComponent('Perfil actualizado.')}`);
}
